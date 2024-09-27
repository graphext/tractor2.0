<script lang="ts">
    import Input from "./Input.svelte";
    import { ApifyClient, ApifyScheduler } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { NEWS_ACTOR_ID } from "$lib/actors";
    import SearchableList from "./SearchableList.svelte";
    import { jsonToCsv, languages } from "../utils";
    import DatePicker from "./DatePicker.svelte";
    import type { DateRange } from "bits-ui";
    import { toast } from "svelte-sonner";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import LiveTable from "./LiveTable.svelte";

    let keywords: string;
    let maxItems: number = 500;
    let selected = languages[0];

    let apifyClient: ApifyClient = new ApifyClient(NEWS_ACTOR_ID);

    let selectedRange: DateRange;
    let timeSteps: Date[];

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

    let confirmChoice = false;
    $: buttonText = loading ? "Loading news..." : "Get News";

    async function checkStatus() {
        if (!runId) return;
        loading = true;

        try {
            const runData = await apifyClient.getRunStatus(runId);

            const { data: liveData, length: dataLength } =
                await apifyClient.getDatasetContent(runId, ["guid"]);

            outputProgress = dataLength;
            headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
            rows =
                dataLength > 0
                    ? liveData
                          .reverse()
                          .filter((d, i) => i < 100) //return 100 last items
                          .map((d) => Object.values(d))
                    : [];
            console.log(headers, rows);

            springProgress.set(outputProgress);

            status = runData.data.status;

            if (error) {
                throw error;
            }
            if (status === "SUCCEEDED" || status === "ABORTED") {
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink(runId, "json", [
                    "guid",
                ]);

                csvBlob = await jsonToCsv(datasetLink);

                datasetData = await apifyClient.getDatasetInfo(runId);
                console.log(datasetData);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;

                return;
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                setTimeout(checkStatus, 2000);
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
        outputProgress = 0;

        const inputData = {
            query: keywords
                .split(",")
                .map((kw) => kw.trim())
                .join(" OR "),
            language: selected.value,
            dateFrom: selectedRange.start?.toString(),
            dateTo: selectedRange.end?.toString(),
            maxItems: maxItems,
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

<div class="">
    <form class="flex flex-col gap-5" on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="keywords" class="text-sm text-base-content/60"
                >Keywords:</label
            >
            <Input
                bind:value={keywords}
                placeholder="Enter keywords separated by commas"
                disabled={loading}
            />
        </div>

        <div class="flex gap-3 justify-between">
            <div>
                <DatePicker
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
                    bind:selected
                    disabled={loading}
                    placeholder="Select language and region"
                />
            </div>

            <div class="flex flex-col gap-1 items-end justify-between">
                <label for="maxItems" class="text-sm text-base-content/60"
                    >News to search for:</label
                >
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral text-right"
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
                    class="progress-overlay mix-blend-overlay absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            <button
                on:click={() => (confirmChoice = true)}
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                disabled={!$apifyKey || !keywords}
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
        <LiveTable {headers} {rows} />
        <div class="flex justify-between items-baseline">
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
                        <span class="loading loading-dots loading-sm"></span>
                    {:else if status == "SUCCEEDED"}
                        <span></span>
                    {:else if status == "FAILED"}
                        <span> </span>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}
