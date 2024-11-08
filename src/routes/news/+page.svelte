<script lang="ts">
    import Input from "$lib/components/Input.svelte";
    import { ApifyClient, ApifyScheduler } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { NEWS_ACTOR_ID } from "$lib/actors";
    import SearchableList from "$lib/components/SearchableList.svelte";
    import {
        checkTaskStatus,
        jsonToCsv,
        languages,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import DateRangePicker from "$lib/components/DateRangePicker.svelte";
    import { today, getLocalTimeZone } from "@internationalized/date";
    import type { DateRange } from "bits-ui";
    import { toast } from "svelte-sonner";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import LiveTable from "$lib/components/LiveTable.svelte";

    import StopButton from "$lib/components/StopButton.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import Status from "$lib/components/Status.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Section from "$lib/components/Section.svelte";

    let keywords: string;
    let maxItems: number = 500;
    let languageSelected = languages[0];

    let apifyClient: ApifyClient = new ApifyClient(NEWS_ACTOR_ID);
    const socialMedia = "google-news";

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
            event: "tractor-fetch-data",
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

                const fileKeyWord = keywords
                    .replaceAll(/[^\w\s]/gi, "")
                    .replaceAll(/\s+/g, "_")
                    .toLowerCase();
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

<Section>
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
                    isDateDisabled={(d) => {
                        return d > today(getLocalTimeZone());
                    }}
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

    <DownloadButton
        {csvBlob}
        {filename}
        {datasetSize}
        {loading}
        {socialMedia}
    />

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
