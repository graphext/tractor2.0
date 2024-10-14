<script lang="ts">
    import Input from "./Input.svelte";
    import { ApifyClient, ApifyScheduler } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { NEWS_ACTOR_ID } from "$lib/actors";
    import SearchableList from "./SearchableList.svelte";
    import {
        checkTaskStatus,
        jsonToCsv,
        languages,
        sendEventData,
        submitTask,
    } from "../utils";
    import DateRangePicker from "./DateRangePicker.svelte";
    import type { DateRange } from "bits-ui";
    import { toast } from "svelte-sonner";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import LiveTable from "./LiveTable.svelte";

    import StopButton from "./StopButton.svelte";
    import ResumeButton from "./ResumeButton.svelte";

    let keywords: string;
    let maxItems: number = 500;
    let languageSelected = languages[0];

    let apifyClient: ApifyClient = new ApifyClient(NEWS_ACTOR_ID);

    let selectedRange: DateRange;
    let timeSteps: Date[];

    let resuming: boolean = false;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkNewsTaskStatus({ apifyClient, maxItems, runId });
        }, 500);
    }

    let error: string;
    let status: string;

    let datasetLink: string;
    let datasetData: any;
    let filename: string;
    let datasetSize: number;

    let loading: boolean = false;

    let headers: string[], rows: Array<string[]>;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let runId: string;
    let userId: string;

    let csvBlob: Blob;

    $: buttonText = loading ? "Loading news..." : "Get News";

    async function handleNewsSubmit() {
        loading = true;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        status = "STARTING";

        sendEventData({
            event: "tractor-download",
            tr_social_media: "google-news",
            tr_user_queries: keywords.split(",").map((kw) => kw.trim()),
            tr_date_range_start: selectedRange.start?.toString(),
            tr_date_range_end: selectedRange.end?.toString(),
            tr_lang_region: languageSelected.value,
            tr_num_items_retrieved: maxItems,
        });

        const inputData = {
            query: keywords
                .split(",")
                .map((kw) => kw.trim())
                .join(" OR "),
            language: languageSelected.value,
            dateFrom: selectedRange.start?.toString(),
            dateTo: selectedRange.end?.toString(),
            maxItems: maxItems,
        };

        submitTask({
            apifyClient,
            inputData,

            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a while...");
                loading = true;

                checkNewsTaskStatus({ apifyClient, maxItems, runId });
            },

            onError: (err: Error) => {
                error = err.message;
                loading = false;
            },
        });
    }

    async function checkNewsTaskStatus({
        apifyClient,
        maxItems,
        runId,
    }: {
        apifyClient: ApifyClient;
        maxItems: number;
        runId: string;
    }) {
        checkTaskStatus({
            apifyClient,
            runId,
            maxResults: maxItems,

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
                              .filter((d: any, i: number) => i < 100) //return 100 last items
                              .map((d: any) => Object.values(d))
                        : [];
            },
            onComplete: async ({
                runId,
                status: completedStatus,
            }: {
                runId: string;
                status: string;
            }) => {
                status = completedStatus;

                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                    omitColumns: ["guid"],
                });

                csvBlob = await jsonToCsv({ url: datasetLink });

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;
            },
            onError: (err: Error) => {
                error = err.message;
                loading = false;
            },
        });
    }
</script>

<div class="">
    <form
        class="flex flex-col gap-5"
        on:submit|preventDefault={handleNewsSubmit}
    >
        <div class="flex flex-col gap-2">
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

        <div class="flex gap-3">
            <div>
                <DateRangePicker
                    disabled={loading}
                    bind:selectedRange
                    bind:timeSteps
                />
            </div>

            <div class="w-1/3">
                <label for="language" class="text-sm text-base-content/60"
                    >Language and Region:</label
                >
                <SearchableList
                    options={languages}
                    bind:selected={languageSelected}
                    disabled={loading}
                    placeholder="Select language and region"
                />
            </div>

            <div class="flex flex-col gap-1 justify-between">
                <label for="maxItems" class="text-sm text-base-content/60"
                    >News to search for:</label
                >
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral"
                    inputmode="numeric"
                    type="number"
                    id="maxItems"
                    disabled={loading}
                    bind:value={maxItems}
                    placeholder="Enter maximum number of items"
                />
            </div>
        </div>

        <div class="w-full relative">
            {#if loading}
                <progress
                    class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            <button
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-md transition-all"
                disabled={!$apifyKey || !keywords}
                class:disabled={!$apifyKey || !keywords}
            >
                {#if loading}
                    <span class="loading loading-spinner loading-sm"></span>
                {/if}
                {buttonText}
            </button>
        </div>
    </form>
</div>

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
                            <span>{outputProgress} news downloaded...</span>
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
