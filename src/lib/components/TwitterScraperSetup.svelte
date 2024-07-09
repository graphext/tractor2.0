<script lang="ts">
    import { onMount } from "svelte";
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import {
        setupTwitterScrapingTask,
        getRunStatus,
        getDataset,
    } from "../apifyEndpoints";

    import { apifyKey } from "../stores/apifyStore";

    let queries = "";
    let runId: string | null = null;
    let status: string | null = null;
    let results: any[] = [];
    let error: string | null = null;

    async function handleSubmit() {
        if (!$apifyKey) {
            error = "Please set your Apify API key first.";
            return;
        }

        const queryList = queries.split("\n").filter((q) => q.trim() !== "");

        try {
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
            status = await getRunStatus(runId);
            if (status === "SUCCEEDED") {
                results = await getDataset(runId);
            } else if (
                status !== "FAILED" &&
                status !== "TIMED-OUT" &&
                status !== "ABORTED"
            ) {
                setTimeout(checkStatus, 5000); // Check again in 5 seconds
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

    <button
        on:click={handleSubmit}
        class="btn btn-primary w-full"
        disabled={!$apifyKey || !queries.trim()}
    >
        Start Twitter Scraping Task
    </button>
</div>

{#if error}
    <p class="mt-4 text-red-500">{error}</p>
{/if}

{#if status}
    <p class="mt-4">Task status: {status}</p>
{/if}

{#if results.length > 0}
    <div class="mt-4">
        <h3 class="text-lg font-semibold">Results:</h3>
        <pre
            class="mt-2 p-2 bg-gray-100 rounded whitespace-pre-wrap">{JSON.stringify(
                results,
                null,
                2,
            )}</pre>
    </div>
{/if}
