<script lang="ts">
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import { toast } from "svelte-sonner";
    import { PaneGroup, Pane, PaneResizer } from "paneforge";
    import { tweened } from "svelte/motion";
    import { apifyKey } from "../stores/apifyStore";
    import { cubicInOut } from "svelte/easing";
    import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";
    import WarningCost from "./WarningCost.svelte";
    import { jsonToCsv } from "$lib/utils";
    import CronEditor from "./CronEditor.svelte";
    import Gauge from "phosphor-svelte/lib/Gauge";
    import Book from "phosphor-svelte/lib/Book";
    import { ApifyClient } from "../apifyEndpoints";

    import { TWITTER_ACT_ID } from "$lib/actors";
    import { createFunctionString } from "$lib/postprocess";
    import LiveTable from "./LiveTable.svelte";
    import StopButton from "./StopButton.svelte";
    import ResumeButton from "./ResumeButton.svelte";
    import { userQuery } from "$lib/stores/userQueryStore";
    import type { DateRange } from "bits-ui";

    import { frequencyStore, selectedLists } from "$lib/stores/store";

    export let queries = "";
    export let selectedRange: DateRange;
    export let queriesSpreadOverTime = "";

    $: numQueries = queriesSpreadOverTime
        ? queriesSpreadOverTime.trim().split("\n").length
        : 0;

    let loading = false;
    let resuming = false;

    let checkStatusTimeout: number;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkStatus();
        }, 500);
    }

    let confirmChoice = false;

    let userId: string | null = null;
    let runId: string | null = null;
    let runData = null;
    let status: string | null = null;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let numTweets = 5000;
    let prettyData = true;

    let headers: string[], rows: Array<string[]>;

    let tweetCost = 0.3 / 1000;
    $: totalApproximateCost = numTweets * tweetCost;

    let datasetLink: string | null = null;
    let datasetData;
    let csvBlob: Blob | null = null;

    let filename: string | null = null;
    let datasetSize: number | null = null;

    const churro =
        "&omit=author,id,type,twitterUrl,inReplyToId,inReplyToUserId,inReplyToUsername,extendedEntities,card,place,entities,quote,quoteId,isConversationControlled";

    $: datasetLinkInButton = `${datasetLink}${prettyData ? churro : ""}`;

    let error: string | null = null;

    $: buttonText = loading ? "Loading tweets..." : "Get Tweets";

    const apifyClient = new ApifyClient(TWITTER_ACT_ID); // Twitter Actor ID

    async function handleSubmit() {
        confirmChoice = false;
        datasetLink = "";
        outputProgress = 0;

        if (!$apifyKey) {
            toast.error("Please set your Apify API key first.");
            error = "Please set your Apify API key first.";
            return;
        }

        const queryList = queriesSpreadOverTime
            .split("\n")
            .filter((q) => q.trim() !== "");
        const nQueries = queriesSpreadOverTime.split("\n").length;
        const maxTweetsPerQuery = Math.ceil(numTweets / nQueries);

        toast.success("Task and run created successfully.");

        setTimeout(() => {
            toast.info("Fetching data. This may take a while...");
        }, 1500);

        if (window.dataLayer) {
            const sendEvent = {
                event: "tractor-download",
                tr_social_media: "twitter",
                tr_gpt_query: $userQuery,
                tr_user_queries: queryList,
                tr_num_items_retrieved: numTweets,
                tr_time_frequency: $frequencyStore,
                tr_date_range_start: selectedRange.start?.toString(),
                tr_date_range_end: selectedRange.end?.toString(),
                tr_lists: $selectedLists,
            };

            console.log(sendEvent);
            window.dataLayer.push(sendEvent);
        }

        try {
            loading = true;

            const task = await apifyClient.createTask({
                searchTerms: queryList,
                maxItems: numTweets,
                maxTweetsPerQuery: maxTweetsPerQuery,
                onlyImage: false,
                onlyQuote: false,
                onlyTwitterBlue: false,
                onlyVerifiedUsers: false,
                onlyVideo: false,
                customMapFunction: createFunctionString(),
            });

            runId = await apifyClient
                .runTask(task.data.id)
                .then((run) => run.data.id);

            error = null;

            checkStatus();
            loading = false;
        } catch (err) {
            error =
                "Error: " + (err instanceof Error ? err.message : String(err));
            console.error(err);
        }
    }

    async function generateDatasetName(queries: string) {
        try {
            const res = await fetch("/api/ids", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: queriesSpreadOverTime }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`,
                );
            }

            return res.text();
        } catch (err) {
            console.error("Error:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
        }
    }

    async function checkStatus() {
        if (!runId) return;

        try {
            runData = await apifyClient.getRunStatus(runId);

            status = runData.data.status;

            if (resuming && status == "RUNNING") resuming = false;

            const { data: liveData, length: dataLength } =
                await apifyClient.getDatasetContent(runId, ["guid"]);

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

            if (error) {
                throw error;
            }

            if (status === "SUCCEEDED" || status === "ABORTED") {
                clearTimeout(checkStatusTimeout);
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink(runId, "json");

                csvBlob = await jsonToCsv(datasetLink, [
                    "createdAt<gx:date>",
                    "authorName<gx:category>",
                    "text<gx:text>",
                    "url<gx:url>",
                    "viewCount<gx:number>",
                ]);

                datasetData = await apifyClient.getDatasetInfo(runId);
                console.log(datasetData);

                const fileKeyWord = await generateDatasetName(
                    queriesSpreadOverTime,
                );
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;

                return;
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                checkStatusTimeout = setTimeout(checkStatus, 1000);
            } else if (status === "FAILED" || status === "TIMED-OUT") {
                loading = false;
                throw Error(
                    "Run failed, timed-out or aborted. Check the APIFY dashboard to know more.",
                );
            }
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            loading = false;
            userId = (await apifyClient.getPrivateUserData()).data.id;
            if (error == "Apify returned an empty dataset.") {
                toast.error(error);
            }
            console.error(err);
        }
    }
</script>

<div class="flex flex-col gap-3">
    <PaneGroup direction="horizontal" class="items-center gap-1 mb-4">
        <Pane defaultSize={30} class="p-1">
            <div
                class="text-base-content/60 overflow-x-clip whitespace-nowrap mb-1"
            >
                Main content queries
            </div>
            <CleanPasteInput
                placeholder="Generate twitter search terms in the input query generator"
                bind:value={queries}
            />
        </Pane>
        <PaneResizer class="text-base-content rounded-sm py-2 h-min">
            <DotsSixVertical size={15} weight="bold" />
        </PaneResizer>
        <Pane defaultSize={70} class="p-1">
            <div
                class="text-base-content/60 overflow-x-clip whitespace-nowrap mb-1"
            >
                What's being sent ({numQueries}
                {numQueries == 1 ? "query" : "queries"})
            </div>
            <CleanPasteInput
                placeholder="Here, the queries will be spread over time"
                bind:value={queriesSpreadOverTime}
                readonly
            />
        </Pane>
    </PaneGroup>

    <div class="w-full flex flex-col gap-3">
        <div class="flex justify-between">
            <div class="flex flex-col gap-2">
                <a
                    class="hover:text-primary text-neutral-400 hover:underline transition-all flex gap-1 items-end"
                    target="_blank"
                    href="https://console.apify.com/actors/runs"
                >
                    <Gauge size={20} /> APIFY Runs Dashboard</a
                >

                <a
                    href="/docs"
                    class="hover:text-primary hover:underline text-neutral-400 transition-all flex gap-1 items-center"
                >
                    <Book size={20} /> Tractor Docs
                </a>
            </div>

            <label
                for="Numtweets"
                class="self-end flex flex-col text-right gap-1"
            >
                <span class="text-sm text-base-content/60"
                    ><b>Max</b> number of tweets to fetch</span
                >
                <input
                    class="input input-sm rounded-full tabular-nums bg-neutral text-right"
                    inputmode="numeric"
                    bind:value={numTweets}
                    type="number"
                    id="Numtweets"
                />
            </label>
        </div>
    </div>

    <div class="w-full relative">
        {#if loading}
            <progress
                class="progress-overlay mix-blend-overlay absolute h-full rounded-full w-full opacity-40"
                max={numTweets}
                value={$springProgress}
            ></progress>
        {/if}
        {#if !confirmChoice}
            <button
                on:click={() => (confirmChoice = true)}
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                disabled={!$apifyKey || !queries}
            >
                {#if loading}
                    <span class="loading loading-ring"></span>
                {/if}
                {buttonText}
            </button>
        {:else}
            <WarningCost {totalApproximateCost} />
            <button
                on:click={handleSubmit}
                class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                disabled={!$apifyKey || !queries}
            >
                Sure. Let's go.
            </button>
        {/if}
    </div>
</div>

{#if csvBlob && filename}
    <a
        class="btn btn-outline btn-primary w-full mt-5 group rounded-full"
        class:disabled={loading}
        href={URL.createObjectURL(csvBlob)}
        download={filename}
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
        <div class="flex flex-col gap-1">
            <div class="flex justify-between items-baseline my-5">
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
                        class="flex gap-3 justify-end items-baseline opacity-30 tabular-nums"
                    >
                        <p class="mt-4">Task status: {status}</p>
                        {#if status == "RUNNING"}
                            <span>{outputProgress} tweets analyzed...</span>
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

<CronEditor
    {numTweets}
    {queries}
    {queriesSpreadOverTime}
    actorId={TWITTER_ACT_ID}
/>

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

    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
    .disabled {
        @apply btn-disabled;
    }
</style>
