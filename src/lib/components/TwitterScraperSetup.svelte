<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import CleanPasteInput from "./CleanPasteInput.svelte";

    import { apifyTerms } from "../stores/userQueryStore";

    import {
        setupTwitterScrapingTask,
        getRunStatus,
        getDatasetLink,
    } from "../apifyEndpoints";

    import { apifyKey } from "../stores/apifyStore";
    import { backOut } from "svelte/easing";

    export let queries = "";

    let loading = false;
    let confirmChoice = false;

    let runId: string | null = null;
    let status: string | null = null;
    let logs: string | null = null;

    let numTweets = 100;
    let prettyData = true;

    let tweetCost = 0.3 / 1000;
    $: totalApproximateCost = numTweets * tweetCost;

    let datasetLink: string | null = null;
    const churro =
        "&omit=id,type,twitterUrl,inReplyToId,inReplyToUserId,inReplyToUsername,extendedEntities,card,place,entities,quote,quoteId,isConversationControlled,coverPicture,status,canDm,canMediaTag,fastFollowersCount,hasCustomTimelines,isTranslator,withheldInCountries,affiliatesHighlightedLabel&unwind=author";

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

        if (!$apifyKey) {
            error = "Please set your Apify API key first.";
            return;
        }

        const queryList = queries.split("\n").filter((q) => q.trim() !== "");
        const nQueries = queries.split("\n").length;
        const maxTweetsPerQuery = Math.ceil(numTweets / nQueries);

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

    async function checkStatus() {
        if (!runId) return;

        try {
            const runData = await getRunStatus(runId);
            status = runData.data.status;

            // const currentPrice = runData.data.usageTotalUsd; //could be used to limit

            if (status === "SUCCEEDED") {
                datasetLink = await getDatasetLink(runId, "json", prettyData);
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

    <div class="self-end w-fit flex flex-col gap-3">
        <label for="prettyData" class="flex items-start self-end gap-3">
            <span>Pretty Data</span>
            <input
                type="checkbox"
                class="toggle toggle-primary"
                bind:checked={prettyData}
            />
        </label>

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
    <a href={datasetLinkInButton} class="btn btn-accent w-full my-5"
        >Download Dataset</a
    >
{/if}

{#if error}
    <p class="mt-4 text-red-500">{error}</p>
{/if}

{#if status}
    <p class="mt-4 font-mono opacity-30">Task status: {status}</p>
{/if}
