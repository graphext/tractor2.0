<script lang="ts">
    import { GOOGLE_ACTOR_ID } from "$lib/actors";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import Input from "$lib/components/Input.svelte";
    import Section from "$lib/components/Section.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { jsonToCsv } from "$lib/utils";
    import { Tooltip } from "bits-ui";
    import { QuestionMark } from "phosphor-svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let apifyClient = new ApifyClient(GOOGLE_ACTOR_ID);

    let keywords: string,
        loading = false,
        maxPages = 5;

    $: buttonText = loading ? "Getting results" : "Get pages";

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let resuming: boolean;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkStatus();
        }, 500);
    }

    let datasetLink: string;
    let runId: string;
    let status: string;
    let error: string;
    let stopping: boolean;
    let csvBlob: Blob;
    let headers: string[], rows: Array<string[]>;
    let checkStatusTimeout: number;
    let userId: string;
    let datasetData: any;
    let filename: string;
    let datasetSize: number;
    let confirmChoice: boolean = false;

    async function checkStatus() {
        if (!runId) return;
        loading = true;

        try {
            const runData = await apifyClient.getRunStatus(runId);
            status = runData.data.status;

            if (resuming && status == "RUNNING") resuming = false;

            const { data: liveData, length: dataLength } =
                await apifyClient.getDatasetContent(runId);

            outputProgress = dataLength;
            headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
            rows =
                dataLength > 0
                    ? liveData
                          .reverse()
                          .filter((d, i) => i < 100) //return 100 last items
                          .map((d) => Object.values(d))
                    : [];

            springProgress.set(outputProgress);

            if (error) {
                throw error;
            }
            if (status === "SUCCEEDED" || status === "ABORTED") {
                clearTimeout(checkStatusTimeout);

                stopping = false;
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                });

                console.log(datasetLink);

                csvBlob = await jsonToCsv({
                    url: datasetLink,
                    dedupKey: "id",
                    customColumnOrder: [
                        "timestamp",
                        "caption",
                        "url",
                        "type",
                        "likesCount",
                        "commentsCount",
                    ],
                    unwind: [
                        {
                            targetCol: "coauthorProducers",
                            fields: [
                                {
                                    field: "username",
                                },
                            ],
                        },
                        {
                            targetCol: "taggedUsers",
                            take: 4,
                            fields: [
                                { field: "username", alias: "first_4_tagged" },
                            ],
                        },
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;

                return;
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                checkStatusTimeout = setTimeout(checkStatus, 2000);
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                loading = false;
                throw Error(
                    "Run failed, timed-out or aborted. Check the APIFY dashboard to know more.",
                );
            }
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            loading = false;
            status = "FAILED";
            userId = (await apifyClient.getPrivateUserData()).data.id;
            if (error == "Apify returned an empty dataset.") {
                toast.error(error);
            }
            console.error(err);
        }
    }

    async function handleSubmit() {
        loading = true;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        confirmChoice = false;
        status = "STARTING";

        if (window.dataLayer) {
            const sendEvent = {
                event: "tractor-download",
                tr_social_media: "google",
                tr_keywords: keywords.split(",").map((k) => k.trim()),
                tr_num_items_retrieved: maxPages,
            };

            window.dataLayer.push(sendEvent);
        }
        let queries = keywords
            .split(",")
            .map((k) => k.trim())
            .join("\n");

        const inputData = {
            includeIcons: false,
            includeUnfilteredResults: false,
            maxPagesPerQuery: 5,
            mobileResults: false,
            queries: queries,
            resultsPerPage: 100,
            saveHtml: false,
            saveHtmlToKeyValueStore: false,
            languageCode: "",
        };

        if (!$apifyKey) {
            console.error("Apify API key is not set");
            return;
        }

        toast.success("Task and run created successfully.");
        setTimeout(() => {
            toast.info("Fetching data. This may take a while...");
        }, 1500);

        try {
            const task = await apifyClient.createTask(inputData);
            runId = await apifyClient
                .runTask(task.data.id)
                .then((run) => run.data.id);

            checkStatus();
        } catch (err) {
            console.error("Error creating or running task:", err);
        }
    }
</script>

<Section>
    <form class="flex flex-col gap-5" on:submit|preventDefault={handleSubmit}>
        <div>
            <div class="flex w-full justify-between gap-3 items-center">
                <div class="flex flex-col gap-2 w-full">
                    <label for="keywords" class="text-sm text-base-content/60"
                        >Keywords:</label
                    >
                    <Input
                        bind:value={keywords}
                        id="keywords"
                        placeholder="Enter keywords separated by commas"
                        disabled={loading}
                    />
                </div>

                <div class="flex flex-col gap-2 justify-between w-full">
                    <div class="flex gap-1">
                        <label
                            for="maxItems"
                            class="text-sm text-base-content/60"
                            >Pages to search for:</label
                        >
                        <Tooltip.Root openDelay={0}>
                            <Tooltip.Trigger class="w-fit">
                                <QuestionMark
                                    size={20}
                                    weight="bold"
                                    class="rounded-full bg-neutral border-2 border-base-300"
                                />
                            </Tooltip.Trigger>
                            <TooltipContent
                                sideOffset={10}
                                transitionConfig={{ duration: 100, y: 10 }}
                            >
                                <div>
                                    <p>
                                        Recommended number sits around 2 to 10
                                        pages.
                                    </p>
                                    <p>
                                        Each one of those pages will return
                                        around 100 results, which adds up to
                                        somewhere in between 200 to 1000
                                        results.
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip.Root>
                    </div>
                    <input
                        class="input input-sm rounded-full tabular-nums bg-neutral"
                        inputmode="numeric"
                        type="number"
                        id="maxItems"
                        disabled={loading}
                        bind:value={maxPages}
                        placeholder="Enter maximum number of items"
                    />
                </div>
            </div>
        </div>

        <div class="w-full relative">
            {#if loading}
                <progress
                    class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                    max={maxPages}
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
                <WarningCost unitPrice={3.5 / 1000} maxItems={maxPages} />
                <button
                    on:click={handleSubmit}
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !keywords}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>
</Section>

<style>
    progress {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: transparent;
    }

    /* For Chrome and Safari */
    progress::-webkit-progress-bar {
        background-color: transparent;
    }

    progress::-webkit-progress-value {
        background-color: white;
    }

    /* For Firefox */
    progress::-moz-progress-bar {
        background-color: white;
    }

    .disabled {
        @apply btn-disabled shadow-none;
    }
</style>
