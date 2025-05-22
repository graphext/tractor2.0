<script lang="ts">
    import { run, preventDefault } from "svelte/legacy";

    import { GOOGLE_ACTOR_ID } from "$lib/actors";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import Input from "$lib/components/Input.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import SearchableList from "$lib/components/SearchableList.svelte";
    import Section from "$lib/components/Section.svelte";
    import Slider from "$lib/components/Slider.svelte";
    import Status from "$lib/components/Status.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import type { SearchGoogleResult } from "$lib/types";
    import {
        checkTaskStatus,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";

    import { countryCodes, languageCodes } from "$lib/options";

    import { Separator, Tooltip, type Selected } from "bits-ui";
    import { CaretRight, QuestionMark } from "phosphor-svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";
    import { fly } from "svelte/transition";
    import { mount } from "svelte";

    let apifyClient = new ApifyClient(GOOGLE_ACTOR_ID, "Google");

    const socialMedia = "google-search";

    let keywords: string = $state(),
        domains: string = $state(),
        loading = $state(false),
        maxPages = $state(1),
        maxResultsPerPage = $state(20),
        countryCode: Selected<string> = $state({
            value: "us",
            label: "🇺🇸 United States",
        });

    let queryLanguage: Selected<string> = $state();
    let mention = $state(false);

    let outputProgress: number = $state(0);
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let resuming: boolean = $state();

    let datasetLink: string;
    let datasetData;
    let runId: string = $state();
    let status: string = $state();
    let error: string = $state();
    let csvBlob: Blob = $state();
    let headers: string[] = $state(),
        rows: Array<string[]> = $state();
    let userId: string;
    let filename: string = $state();
    let datasetSize: number = $state();
    let confirmChoice: boolean = $state(false);

    async function handleGoogleSubmit() {
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        confirmChoice = false;
        status = "STARTING";

        let queries = keywords
            .split(",")
            .filter((e) => !/^\s*$/g.test(e))
            .map((k) => k.trim());
        let inputQueries: string = "";

        if (domains && domains != "") {
            // if there's domains, craft queries in "keyword site:domain" format
            let domainsSplit = domains
                .split(",")
                .filter((e) => !/^\s*$/g.test(e))
                .map((k) => k.trim());

            let domainScopedKeywords = [];
            for (const q of queries) {
                for (const d of domainsSplit) {
                    const qDomain = `${q} site:${d}`;
                    domainScopedKeywords.push(qDomain);
                }
            }

            inputQueries = domainScopedKeywords.join("\n");
        } else {
            // put queries in line-by-line format
            inputQueries = queries.join("\n");
        }

        console.log(inputQueries);

        let inputData = {
            includeIcons: false,
            includeUnfilteredResults: false,
            maxPagesPerQuery: maxPages,
            mobileResults: false,
            queries: inputQueries,
            resultsPerPage: maxResultsPerPage,
            saveHtml: false,
            saveHtmlToKeyValueStore: false,
            countryCode: countryCode.value.toLowerCase(),
        };

        sendEventData({
            event: "tractor-fetch-data",
            tr_social_media: "google",
            tr_keywords: keywords.split(",").map((k) => k.trim()),
            tr_num_items_retrieved: maxPages,
        });

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a while...");

                loading = true;
                // check for task status and update UI
                checkGoogleTaskStatus({ apifyClient, maxPages, runId });
            },

            //oh shoot
            onError: (err: Error) => {
                error = err.message;
                loading = false;
            },
        });
    }

    const checkGoogleTaskStatus = ({
        apifyClient,
        runId,
        maxPages,
    }: {
        apifyClient: ApifyClient;
        runId: string | null;
        maxPages: number;
    }) => {
        checkTaskStatus({
            apifyClient,
            runId,
            maxResults: maxPages,
            // new data? plot it
            onStatusUpdate: ({
                status: currentStatus,
                dataLength,
                liveData,
            }: {
                status: string;
                dataLength: number;
                liveData: any;
            }) => {
                if (resuming && status == "RUNNING") resuming = false;

                status = currentStatus;
                outputProgress = dataLength;
                springProgress.set(outputProgress);

                headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
                rows =
                    dataLength > 0
                        ? liveData
                              .reverse()
                              .filter((d, i) => i < 100) //return 100 last items
                              .map((d) => Object.values(d))
                        : [];
            },

            //finished? create links and blobs, process data with
            //jsonToCsv
            onComplete: async ({
                runId,
                status: completedStatus,
            }: {
                runId: string;
                status: string;
            }) => {
                status = completedStatus;

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord =
                    `${selectedGenerator}_${userPromptCompanies}`.replaceAll(
                        /[^a-zA-Z0-9]/g,
                        "_",
                    );
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                    omitColumns: [
                        "relatedQueries",
                        "peopleAlsoAsk",
                        "paidResults",
                        "serpProviderCode",
                        "suggestedResults",
                        "hasNextPage",
                        "customData",
                        "paidProducts",
                        "Rec",
                    ],
                });

                csvBlob = await jsonToCsv<SearchGoogleResult>({
                    url: datasetLink,
                    unwind: [
                        {
                            targetCol: "searchQuery",
                            fields: [
                                {
                                    field: "term",
                                },
                                {
                                    field: "url",
                                },
                            ],
                        },
                    ],
                    pivot: {
                        column: "organicResults",
                        pivot: [
                            "title",
                            "url",
                            "description",
                            "emphasizedKeywords",
                            "position",
                        ],
                    },
                    removeColumns: [
                        "organicResults",
                        "searchQuery.url",
                        "searchQuery.device",
                        "searchQuery.type",
                        "searchQuery.countryCode",
                        "searchQuery.languageCode",
                        "searchQuery.locationUule",
                        "searchQuery.resultsPerPage",
                    ],
                    customColumnOrder: [
                        "position",
                        "title",
                        "url",
                        "description",
                        "emphasizedKeywords",
                    ],
                });

                datasetSize = datasetData.data.itemCount;

                loading = false;
            },

            //oh shoot
            onError: (err: Error) => {
                error = err.message;
                loading = false;
                toast.error(err.message);
            },
        });
    };

    let seoQueries: string;
    let userPromptCompanies: string = $state();
    let searchQueriesPerCompany: number[] = $state([2]);
    let displaySearchQueriesPerCompany: Record<number, string> = {
        1: "Less queries: ~5-10",
        2: "More queries: ~20-30",
        3: "Tons of queries: ~50",
    };

    let selectedGenerator: string = $state("Related Queries");
    let apiMap: Record<string, string> = {
        "Related Queries": "api/seo",
        Competitors: "api/competitors",
        "Pain points": "api/pain-points",
    };

    async function generateQueries() {
        loading = true;
        error = "";
        keywords = "";

        try {
            const res = await fetch(apiMap[selectedGenerator], {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: `${userPromptCompanies},
${displaySearchQueriesPerCompany[searchQueriesPerCompany[0]]},
${queryLanguage?.value},
${mention ? "Include queries where you mention the companies explicitly wherever possible." : "Don't mention companies explicitly, or at all. Try to avoid mentioning the companies as hard as possible."}`,
                }),
            });
            console.log(
                `${userPromptCompanies}, ${displaySearchQueriesPerCompany[searchQueriesPerCompany[0]]}`,
            );

            if (!res.ok) {
                const errorData = await res.json();
                throw mount(
                    Error,
                    errorData.error || `HTTP error! status: ${res.status}`,
                );
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                keywords += chunk;
            }
        } catch (err) {
            console.error("Error:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            toast.error(error);
        } finally {
            loading = false;
        }
    }
    $effect(() => {
        if (resuming) {
            loading = true;

            setTimeout(() => {
                checkGoogleTaskStatus({ apifyClient, runId, maxPages });
            }, 500);
        }
    });
    let buttonText = $derived(loading ? "Getting results" : "Get pages");
</script>

<main class="flex flex-col gap-5">
    <Section>
        <div class="flex flex-col gap-3">
            <h2 class="uppercase opacity-70">Query Generation</h2>
            <div class="flex items-center">
                <div class="flex gap-2 items-center">
                    <Tooltip.Root openDelay={0}>
                        <Tooltip.Trigger class="w-fit">
                            <QuestionMark
                                size={24}
                                weight="bold"
                                class="rounded-full bg-neutral border-2 border-base-300"
                            />
                        </Tooltip.Trigger>
                        <TooltipContent
                            side="right"
                            sideOffset={30}
                            transitionConfig={{ duration: 100, x: -5 }}
                        >
                            <div class="prose prose-sm">
                                <p>
                                    You can select between these Query
                                    Generators, or you can write (and edit) the
                                    queries yourself.
                                </p>
                                <p>
                                    Type in some company names to get search
                                    queries related to them.
                                </p>
                                <h4>Related Queries</h4>
                                <p>
                                    The Related Queries generator generates
                                    queries in which the user may not know the
                                    company or product but said product would
                                    rank high in those searches.
                                </p>
                                <h4>Competitors</h4>
                                <p>
                                    The Competitors generator generates queries
                                    in which the user is looking for
                                    alternatives or competitors, sometimes
                                    directly comparing it to another product or
                                    simply searching for alternatives.
                                </p>

                                <h4>Pain points</h4>
                                <p>
                                    The Pain Points generator generates queries
                                    in which the user usually looks for support
                                    or has problems with a certain product or
                                    service. On well known products, this works
                                    particularly well, generating quite specific
                                    queries.
                                </p>
                            </div>
                        </TooltipContent>
                    </Tooltip.Root>

                    <div class="flex join rounded-full" role="radiogroup">
                        <input
                            class="join-item btn btn-sm border border-base-content/10
                            checked:font-bold font-normal"
                            type="radio"
                            checked
                            bind:group={selectedGenerator}
                            value="Related Queries"
                            aria-label="Related Queries"
                        />

                        <input
                            class="join-item btn btn-sm border border-base-content/10
                            checked:font-bold
                            font-normal"
                            type="radio"
                            value="Competitors"
                            bind:group={selectedGenerator}
                            aria-label="Competitors"
                        />

                        <input
                            class="join-item btn btn-sm border border-base-content/10
                            font-normal checked:font-bold"
                            type="radio"
                            value="Pain points"
                            bind:group={selectedGenerator}
                            aria-label="Pain points"
                        />
                    </div>
                </div>

                <div class="divider divider-horizontal"></div>

                <div
                    class="flex flex-col w-32 h-full justify-between mb-1 gap-1"
                >
                    <div class="text-[12px] opacity-60">
                        <div class="flex justify-between">
                            {#each displaySearchQueriesPerCompany[searchQueriesPerCompany[0]].split(":") as item, i}
                                {#if i == 1}
                                    <div class="font-bold">{item}</div>
                                {:else}
                                    <div class="">{item}</div>
                                {/if}
                            {/each}
                        </div>
                    </div>

                    <Slider bind:value={searchQueriesPerCompany} steps={3} />
                </div>

                <div class="divider divider-horizontal"></div>

                <div class="flex flex-col gap-2">
                    <SearchableList
                        placeholder="Query Language"
                        bind:selected={queryLanguage}
                        disabled={loading}
                        options={languageCodes.map((e) => {
                            return { value: e.lang, label: e.lang };
                        })}
                    ></SearchableList>
                </div>

                <div class="divider divider-horizontal"></div>

                <Tooltip.Root closeOnPointerDown={false} openDelay={0}>
                    <Tooltip.Trigger class="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="mention"
                            bind:checked={mention}
                            class="checkbox checkbox-primary checkbox-sm"
                        />
                        <label
                            for="mention"
                            class:mention
                            class="opacity-60
                            transition-all">Mention companies</label
                        >
                    </Tooltip.Trigger>
                    <TooltipContent
                        side="top"
                        transition={fly}
                        transitionConfig={{ duration: 100, y: 5 }}
                        sideOffset={10}
                        align={"center"}
                        >Explicitly mention the company in the query. If
                        disabled, the company name won't appear in the queries.</TooltipContent
                    >
                </Tooltip.Root>
            </div>

            <form class="join w-full">
                <input
                    class="join-item w-full bg-neutral input input-sm rounded-full"
                    bind:value={userPromptCompanies}
                    placeholder="Enter company names separated by commas"
                    disabled={loading}
                />

                <button
                    class="join-item btn btn-primary btn-sm rounded-full"
                    onclick={generateQueries}
                >
                    <CaretRight weight="bold" size={20} />
                </button>
            </form>
        </div>
    </Section>

    <Section>
        <form
            class="flex flex-col gap-5"
            onsubmit={preventDefault(handleGoogleSubmit)}
        >
            <div class="flex flex-col gap-2 w-full">
                <label for="keywords" class="text-sm text-base-content/60"
                    >Keywords:</label
                >
                <textarea
                    class="textarea bg-neutral w-full font-mono h-full overflow-x-scroll shadow-sm"
                    rows="6"
                    bind:value={keywords}
                    id="keywords"
                    placeholder="Enter keywords separated by commas"
                    disabled={loading}
                ></textarea>
            </div>
            <div>
                <div class="flex w-full justify-between gap-3 items-center">
                    <div class="flex flex-col gap-2 w-full">
                        <label
                            for="domains"
                            class="text-sm text-base-content/60 w-full"
                            >Domains (optional):</label
                        >
                        <Input
                            bind:value={domains}
                            id="domains"
                            placeholder="Search on these domains. Separate them by commas. For example: graphext.com, google.com, youtube.com"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3">
                <div class="flex flex-col gap-1">
                    <label for="maxPages" class="text-sm opacity-60"
                        >Pages to search for</label
                    >
                    <input
                        class="input input-sm rounded-full tabular-nums bg-neutral"
                        inputmode="numeric"
                        type="number"
                        id="maxPages"
                        disabled={loading}
                        bind:value={maxPages}
                        placeholder="Enter maximum number of items"
                    />
                </div>

                <div class="flex flex-col gap-1">
                    <label for="maxPages" class="text-sm opacity-60"
                        >Results per page</label
                    >
                    <input
                        class="input input-sm rounded-full tabular-nums bg-neutral"
                        inputmode="numeric"
                        type="number"
                        id="maxPages"
                        onchange={() => {
                            if (maxResultsPerPage > 100) {
                                console.log("fuck");
                                maxResultsPerPage = 100;
                            }
                        }}
                        disabled={loading}
                        bind:value={maxResultsPerPage}
                        placeholder="Enter maximum number of items"
                    />
                </div>

                <div class="w-1/3 flex flex-col gap-1">
                    <div class="text-sm opacity-60">Country</div>
                    <SearchableList
                        bind:selected={countryCode}
                        disabled={loading}
                        options={countryCodes.map((e) => {
                            return { value: e.code, label: e.name };
                        })}
                    ></SearchableList>
                </div>
            </div>

            <div class="w-full relative">
                {#if loading}
                    <progress
                        class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                        max={keywords.split(",").length * 5}
                        value={$springProgress}
                    ></progress>
                {/if}
                {#if !confirmChoice}
                    <button
                        onclick={() => (confirmChoice = true)}
                        class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                        disabled={!$apifyKey || !keywords}
                        class:disabled={!$apifyKey || !keywords}
                    >
                        {#if loading}
                            <span class="loading loading-ring"></span>
                        {/if}
                        {buttonText}
                    </button>
                {:else}
                    <WarningCost
                        unitPrice={3.5 / 1000}
                        maxItems={keywords.split(",").length * 5}
                    />
                    <button
                        class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                        disabled={!$apifyKey || !keywords}
                    >
                        Sure. Let's go.
                    </button>
                {/if}
            </div>
        </form>

        <DownloadButton
            {csvBlob}
            {filename}
            {datasetSize}
            {loading}
            {socialMedia}
        />

        {#if error || status}
            <div>
                <div class="divider mt-3 mb-3"></div>

                <div class="flex flex-col gap-5">
                    <div class="flex justify-between items-baseline">
                        {#if status == "RUNNING" || status == "ABORTING"}
                            <StopButton {apifyClient} {runId} />
                        {/if}

                        {#if status == "ABORTED" || status == "READY"}
                            <ResumeButton
                                {status}
                                bind:resuming
                                {apifyClient}
                                {runId}
                            />
                        {/if}

                        {#if error}
                            <Error {error} {userId} {runId} />
                        {:else}
                            <p class="opacity-0">error</p>
                        {/if}

                        {#if status}
                            <Status {status} {outputProgress} />
                        {/if}
                    </div>

                    <LiveTable {headers} {rows} />
                </div>
            </div>
        {/if}
    </Section>
</main>

<style>
    textarea {
        field-sizing: content;
    }
    .mention {
        @apply opacity-100 text-primary;
    }
</style>
