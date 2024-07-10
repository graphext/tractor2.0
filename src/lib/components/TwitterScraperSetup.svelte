<script lang="ts">
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import {
        setupTwitterScrapingTask,
        getRunStatus,
        getDatasetLink,
        getRunLogs,
    } from "../apifyEndpoints";

    import { apifyKey } from "../stores/apifyStore";
    import {
        backOut,
        bounceOut,
        elasticInOut,
        elasticOut,
    } from "svelte/easing";

    let queries = "";
    let loading = false;
    let confirmChoice = false;

    let runId: string | null = null;
    let status: string | null = null;
    let logs: string | null = null;

    let datasetLink: string | null = null;
    let error: string | null = null;

    $: buttonText = loading ? "Loading tweets..." : "Get Tweets";

    async function handleSubmit() {
        if (!$apifyKey) {
            error = "Please set your Apify API key first.";
            return;
        }

        const queryList = queries.split("\n").filter((q) => q.trim() !== "");

        try {
            loading = true;

            runId = await setupTwitterScrapingTask(queryList);
            error = null;

            checkStatus();
        } catch (err) {
            error =
                "Failed to setup Twitter scraping task. " +
                (err instanceof Error ? err.message : String(err));
            console.error(err);
        }
    }

    async function checkStatus() {
        if (!runId) return;

        try {
            const runData = await getRunStatus(runId);
            logs = await getRunLogs(runId);
            console.log(logs);
            status = runData.data.status;

            const currentPrice = runData.data.usageTotalUsd;

            if (status === "SUCCEEDED" || currentPrice >= 2) {
                datasetLink = await getDatasetLink(runId);
                loading = false;
            } else if (
                status !== "FAILED" &&
                status !== "TIMED-OUT" &&
                status !== "ABORTED" &&
                currentPrice < 1
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

    onMount(() => {
        if (!$apifyKey) {
            error = "Please set your Apify API key in the settings.";
        }
    });
</script>

<div class="flex flex-col gap-3">
    <CleanPasteInput
        placeholder="Enter Twitter search queries, one per line"
        bind:value={queries}
    />

    <div class="w-full relative">
        {#if loading}
            <progress
                value="30"
                max="100"
                class="absolute h-full w-full opacity-30"
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
                font-semibold border border-warning-content/20 rounded-btn"
                in:fly={{ y: -20, duration: 400, easing: backOut }}
            >
                Current actor runs at $0.3/1K tweets. This operation will cost
                approximately $0.5
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
    <a href={datasetLink} class="btn btn-accent w-full">Download Dataset</a>
{/if}

{#if logs}
    <div>
        {logs.toString()}
    </div>
{/if}

{#if error}
    <p class="mt-4 text-red-500">{error}</p>
{/if}

{#if status}
    <p class="mt-4">Task status: {status}</p>
{/if}
