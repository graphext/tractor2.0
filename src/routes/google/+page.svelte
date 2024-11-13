<script lang="ts">
    import { GOOGLE_ACTOR_ID } from "$lib/actors";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import CleanPasteInput from "$lib/components/CleanPasteInput.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import Input from "$lib/components/Input.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Section from "$lib/components/Section.svelte";
    import Status from "$lib/components/Status.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import type { OrganicGoogleResult, SearchGoogleResult } from "$lib/types";
    import {
        checkTaskStatus,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { Tooltip } from "bits-ui";
    import {
        ArrowRight,
        CaretRight,
        QuestionMark,
        TagChevron,
    } from "phosphor-svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let apifyClient = new ApifyClient(GOOGLE_ACTOR_ID);

    const socialMedia = "google-search";

    let keywords: string,
        domains: string,
        loading = false,
        maxPages = 5;

    $: buttonText = loading ? "Getting results" : "Get pages";

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let resuming: boolean;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkGoogleTaskStatus({ apifyClient, runId, maxPages });
        }, 500);
    }

    let datasetLink: string;
    let datasetData;
    let runId: string;
    let status: string;
    let error: string;
    let csvBlob: Blob;
    let headers: string[], rows: Array<string[]>;
    let userId: string;
    let filename: string;
    let datasetSize: number;
    let confirmChoice: boolean = false;

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
            maxPagesPerQuery: 5,
            mobileResults: false,
            queries: inputQueries,
            resultsPerPage: 100,
            saveHtml: false,
            saveHtmlToKeyValueStore: false,
            languageCode: "",
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
    let userPromptCompanies: string;

    let selectedGenerator: string = "SEO";
    let apiMap: Record<string, string> = {
        SEO: "api/seo",
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
                body: JSON.stringify({ prompt: userPromptCompanies }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
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
</script>

<main class="flex flex-col gap-5">
    <Section>
        <div class="flex flex-col gap-3">
            <h2 class="uppercase opacity-70">Query Generation</h2>
            <div class="flex gap-3">
                <div class="flex join" role="radiogroup">
                    <input
                        class="join-item btn btn-sm border border-base-content/10
                        checked:font-bold font-normal"
                        type="radio"
                        checked
                        bind:group={selectedGenerator}
                        value="SEO"
                        aria-label="SEO"
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
                                You can select between these Query Generators,
                                or you can write (and edit) the queries
                                yourself.
                            </p>
                            <p>
                                Type in some company names to get search queries
                                related to them.
                            </p>
                            <h4>SEO</h4>
                            <p>
                                The SEO generator generates queries in which the
                                user may not know the company or product but
                                said product would rank high in those searches.
                            </p>
                            <h4>Competitors</h4>
                            <p>
                                The Competitors generator generates queries in
                                which the user is looking for alternatives or
                                competitors, sometimes directly comparing it to
                                another product or simply searching for
                                alternatives.
                            </p>

                            <h4>Pain points</h4>
                            <p>
                                The Pain Points generator generates queries in
                                which the user usually looks for support or has
                                problems with a certain product or service. On
                                well known products, this works particularly
                                well, generating quite specific queries.
                            </p>
                        </div>
                    </TooltipContent>
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
                    on:click={generateQueries}
                >
                    <CaretRight weight="bold" size={20} />
                </button>
            </form>
        </div>
    </Section>

    <Section>
        <form
            class="flex flex-col gap-5"
            on:submit|preventDefault={handleGoogleSubmit}
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
                />
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
                        on:click={() => (confirmChoice = true)}
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
</style>
