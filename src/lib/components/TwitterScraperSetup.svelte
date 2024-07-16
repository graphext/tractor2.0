<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import { toast } from "svelte-sonner";

    import { apifyTerms } from "../stores/userQueryStore";

    import {
        setupTwitterScrapingTask,
        getRunStatus,
        getDatasetLink,
        getLogsForRun,
        getDatsetInfo,
    } from "../apifyEndpoints";

    import { apifyKey } from "../stores/apifyStore";
    import { backOut } from "svelte/easing";

    export let queries = "";

    let loading = false;
    let confirmChoice = false;

    let runId: string | null = null;
    let status: string | null = null;
    let logs: string | null = null;
    const regex = /Got (\d+) results/g;
    let progressLogs: number = 0;

    let numTweets = 2000;
    let prettyData = true;

    let tweetCost = 0.3 / 1000;
    $: totalApproximateCost = numTweets * tweetCost;

    let datasetLink: string | null = null;
    let datasetSize: number | null = null;
    const churro =
        "&omit=id,type,twitterUrl,inReplyToId,inReplyToUserId,inReplyToUsername,extendedEntities,card,place,entities,quote,quoteId,isConversationControlled";

    $: datasetLinkInButton = `${datasetLink}${prettyData ? churro : ""}`;

    let error: string | null = null;

    $: buttonText = loading ? "Loading tweets..." : "Get Tweets";

    onMount(() => {
        if ($apifyTerms) {
            queries = $apifyTerms;
        }
    });

    async function handleSubmit() {
        confirmChoice = false;
        datasetLink = "";
        progressLogs = 0;
        logs = "";

        if (!$apifyKey) {
            toast.error("Please set your Apify API key first.");
            error = "Please set your Apify API key first.";
            return;
        }

        const queryList = queries.split("\n").filter((q) => q.trim() !== "");
        const nQueries = queries.split("\n").length;
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

    async function processLogs(logsReader: ReadableStreamDefaultReader) {
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await logsReader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            logs += chunk;

            let matches = [...logs?.matchAll(regex)];
            for (const match of matches) {
                progressLogs += parseInt(match[1]);
            }
        }
    }

    async function checkStatus() {
        if (!runId) return;

        try {
            const runData = await getRunStatus(runId);
            const logsReader = await getLogsForRun(runId);

            processLogs(logsReader);

            status = runData.data.status;

            // const currentPrice = runData.data.usageTotalUsd; //could be used to limit

            if (status === "SUCCEEDED") {
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await getDatasetLink(runId, "json");

                const datasetInfo = await getDatsetInfo(runId);

                datasetSize = datasetInfo.data.itemCount;

                loading = false;

                return;
            } else if (
                status !== "FAILED" &&
                status !== "TIMED-OUT" &&
                status !== "ABORTED"
            ) {
                setTimeout(checkStatus, 5000); // Check again in 5 seconds
            } else if (
                status !== "FAILED" &&
                status !== "TIMED-OUT" &&
                status !== "ABORTED"
            ) {
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
    <CleanPasteInput
        placeholder="Enter Twitter search queries, one per line"
        bind:value={queries}
    />

    <div class="self-end w-full flex flex-col gap-3">
        <div class="flex justify-between">
            <a
                class="text-primary hover:underline"
                target="_blank"
                href="https://console.apify.com/actors/runs"
                >APIFY Runs Dashboard</a
            >
            <label for="prettyData" class="flex items-start self-end gap-3">
                <span>Pretty Data</span>
                <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    bind:checked={prettyData}
                />
            </label>
        </div>

        <label for="Numtweets" class="self-end flex flex-col text-right">
            <span>Number of tweets to retrieve</span>
            <input
                class="input input-bordered font-mono text-right"
                inputmode="numeric"
                bind:value={numTweets}
                type="number"
                id="Numtweets"
            />
        </label>
    </div>

    <div class="w-full relative">
        {#if loading}
            <progress
                class="progress-overlay absolute h-full rounded-none w-full opacity-30"
                max={numTweets}
                value={progressLogs}
            ></progress>
        {/if}
        {#if !confirmChoice}
            <button
                on:click={() => (confirmChoice = true)}
                class="btn btn-primary w-full"
                disabled={!$apifyKey || !queries.trim()}
            >
                {buttonText}
            </button>
        {:else}
            <div
                class="my-2 p-3 bg-warning
                text-warning-content
                 border border-warning-content/20 rounded-btn"
                in:fly={{ y: -20, duration: 400, easing: backOut }}
            >
                Current actor runs at <span class="font-semibold"
                    >$0.3/1K tweets</span
                >. This operation will cost approximately
                <span class="font-semibold"
                    >${totalApproximateCost.toFixed(3)}</span
                >
            </div>
            <button
                on:click={handleSubmit}
                class="btn btn-primary w-full"
                disabled={!$apifyKey || !queries.trim()}
            >
                Sure. Let's go.
            </button>
        {/if}
    </div>
</div>

{#if datasetLink}
    <a
        href={datasetLinkInButton}
        class="btn btn-outline btn-primary w-full my-5"
        >Download Dataset ({#if !datasetSize}
            <span class="loading loading-ring loading-sm inline-block"></span>
        {:else}
            {datasetSize}
        {/if} rows)</a
    >
{/if}

{#if error}
    <p class="mt-4 text-red-500">{error}</p>
{/if}

{#if status}
    <div
        class="flex gap-3 justify-end items-end opacity-30 tabular-nums text-right"
    >
        <p class="mt-4">Task status: {status}</p>
        {#if status == "RUNNING"}
            <span>{progressLogs} tweets fetched...</span>
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
</style>
