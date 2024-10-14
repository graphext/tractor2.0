<script lang="ts">
    import { GOOGLE_ACTOR_ID } from "$lib/actors";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import Input from "$lib/components/Input.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Section from "$lib/components/Section.svelte";
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
            checkGoogleTaskStatus({ apifyClient, runId, maxPages });
        }, 500);
    }

    let datasetLink: string;
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
            .map((k) => k.trim())
            .join("\n");

        let inputData = {
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

        sendEventData({
            event: "tractor-download",
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
                datasetLink,
                runId,
                status: completedStatus,
            }: {
                datasetLink: string;
                runId: string;
                status: string;
            }) => {
                status = completedStatus;

                let datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;

                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                csvBlob = await jsonToCsv<SearchGoogleResult>({
                    url: datasetLink,
                    unwind: [
                        {
                            targetCol: "organicResults",
                            take: "max",
                            fields: [
                                {
                                    field: "title",
                                },
                                {
                                    field: "siteLinks",
                                },
                            ],
                        },
                        {
                            targetCol: "relatedQueries",
                            take: 4,
                            fields: [{ field: "title" }, { field: "url" }],
                        },
                    ],
                });

                datasetSize = datasetData.data.itemCount;

                loading = false;
                console.log(loading);
            },

            //oh shoot
            onError: (err: Error) => {
                error = err.message;
                loading = false;
                toast.error(err.message);
            },
        });
    };
</script>

<Section>
    <form
        class="flex flex-col gap-5"
        on:submit|preventDefault={handleGoogleSubmit}
    >
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
                    on:click={handleGoogleSubmit}
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !keywords}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>

    {#if csvBlob && filename}
        <a
            href={URL.createObjectURL(csvBlob)}
            download={filename}
            class:disabled={loading}
            class="btn btn-outline btn-primary w-full mt-5 group rounded-full"
            >Download Dataset <span
                class="font-mono badge badge-primary badge-xs group-hover:badge-warning"
                >.csv</span
            >
            {#if datasetSize}
                — {datasetSize} rows
            {/if}
        </a>
    {/if}

    {#if error || status}
        <div>
            <div class="divider mt-3 mb-3" />

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
                        <div class="flex items-center gap-3">
                            <p>{error}</p>
                            <a
                                href="https://console.apify.com/organization/{userId}/actors/runs/{runId}#output"
                                target="_blank"
                                class:disabled={userId == undefined ||
                                    runId == undefined}
                                class="btn btn-xs btn-error">Go to run</a
                            >
                        </div>
                    {:else}
                        <p class="opacity-0">error</p>
                    {/if}

                    {#if status}
                        <div
                            class="flex gap-3 justify-end items-end opacity-30 tabular-nums text-right"
                        >
                            <p class="mt-4">Task status: {status}</p>
                            {#if status == "RUNNING"}
                                <span
                                    >{outputProgress} results downloaded...</span
                                >
                                <span class="loading loading-dots loading-sm"
                                ></span>
                            {:else if status == "SUCCEEDED"}
                                <span></span>
                            {:else if status == "FAILED"}
                                <span> </span>
                            {/if}
                        </div>
                    {/if}
                </div>

                <LiveTable {headers} {rows} />
            </div>
        </div>
    {/if}
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
