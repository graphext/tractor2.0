<script lang="ts">
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import { toast } from "svelte-sonner";

    import { PaneGroup, Pane, PaneResizer } from "paneforge";

    import { tweened } from "svelte/motion";

    import {
        setupTwitterScrapingTask,
        getRunStatus,
        getDatasetLink,
        getDatsetInfo,
        getDatsetLength,
        getPrivateUserData,
    } from "../apifyEndpoints";

    import { apifyKey } from "../stores/apifyStore";
    import { cubicInOut } from "svelte/easing";
    import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";
    import WarningCost from "./WarningCost.svelte";
    import { jsonToCsv } from "$lib/utils";
    import CronEditor from "./CronEditor.svelte";
    import Gauge from "phosphor-svelte/lib/Gauge";
    import Book from "phosphor-svelte/lib/Book";

    export let queries = "";
    export let queriesSpreadOverTime = "";

    $: numQueries = queriesSpreadOverTime
        ? queriesSpreadOverTime.trim().split("\n").length
        : 0;

    let loading = false;
    let confirmChoice = false;

    let runId: string | null = null;
    let status: string | null = null;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let numTweets = 5000;
    let prettyData = true;

    let tweetCost = 0.3 / 1000;
    $: totalApproximateCost = numTweets * tweetCost;

    let datasetLink: string | null = null;
    let datasetData;
    let csvBlob: Blob | null = null;

    let filename: string | null = null;
    let datasetSize: number | null = null;

    let cronExpression: string;

    const churro =
        "&omit=author,id,type,twitterUrl,inReplyToId,inReplyToUserId,inReplyToUsername,extendedEntities,card,place,entities,quote,quoteId,isConversationControlled";

    $: datasetLinkInButton = `${datasetLink}${prettyData ? churro : ""}`;

    let error: string | null = null;

    $: buttonText = loading ? "Loading tweets..." : "Get Tweets";

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

        toast.success("Task and run created sucessfully.");

        setTimeout(() => {
            toast.info("Fetching data. This may take a while...");
        }, 1500);

        try {
            loading = true;

            runId = await setupTwitterScrapingTask(
                queryList,
                numTweets,
                maxTweetsPerQuery,
            );
            error = null;

            checkStatus();
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
            const runData = await getRunStatus(runId);

            outputProgress = await getDatsetLength(runId);
            springProgress.set(outputProgress);

            status = runData.data.status;

            // const currentPrice = runData.data.usageTotalUsd; //could be used to limit

            if (status === "SUCCEEDED" || status === "ABORTED") {
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await getDatasetLink(runId, "json");

                csvBlob = await jsonToCsv(datasetLink, [
                    "createdAt<gx:date>",
                    "authorName<gx:category>",
                    "text<gx:text>",
                    "url<gx:url>",
                    "viewCount<gx:number>",
                ]);

                datasetData = await getDatsetInfo(runId);

                const fileKeyWord = await generateDatasetName(
                    queriesSpreadOverTime,
                );
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
            error =
                "Failed to check task status. " +
                (err instanceof Error ? err.message : String(err));
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
                <span class="text-sm">Number of tweets to retrieve</span>
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
                {buttonText}
            </button>
        {:else}
            <WarningCost {totalApproximateCost} />
            <button
                on:click={handleSubmit}
                class="btn btn-primary w-full shadow-primary/20 shadow-md rounded-full"
                disabled={!$apifyKey || !queries}
            >
                Sure. Let's go.
            </button>
        {/if}
    </div>
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

<CronEditor {numTweets} {queries} bind:cronExpression />

{#if error}
    <p class="mt-4 text-red-500">{error}</p>
{/if}

{#if status}
    <div
        class="flex gap-3 justify-end items-end opacity-30 tabular-nums text-right"
    >
        <p class="mt-4">Task status: {status}</p>
        {#if status == "RUNNING"}
            <span>{outputProgress} tweets analyzed...</span>
            <span class="loading loading-dots loading-sm"></span>
        {:else if status == "SUCCEEDED"}
            <span></span>
        {:else if status == "FAILED"}
            <span> </span>
        {/if}
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
</style>
