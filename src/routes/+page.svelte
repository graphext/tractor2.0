<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import { createEventDispatcher } from "svelte";

    import TwitterScraperSetup from "$lib/components/TwitterScraperSetup.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";

    let queries = "";
    let runId: string | null = null;
    let status: string | undefined = undefined;
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
            checkStatus();
        } catch (err) {
            error = "Failed to setup Twitter scraping task.";
            console.error(err);
        }
    }

    async function checkStatus() {
        if (!runId) return;

        try {
            status = await getRunStatus(runId);
            if (status === "SUCCEEDED") {
                const run = await getDataset(runId);
                results = run;
            } else if (
                status !== "FAILED" &&
                status !== "TIMED-OUT" &&
                status !== "ABORTED"
            ) {
                setTimeout(checkStatus, 5000); // Check again in 5 seconds
            }
        } catch (err) {
            error = "Failed to check task status.";
            console.error(err);
        }
    }
</script>

<div class="mb-10">
    <h1 class="text-xl font-bold text-center md:text-left">Tractor</h1>
    <h2 class="w-1/2 md:w-full mx-auto text-center text-balance md:text-left">
        Scraping made easy. Put your Apify key, and let us do the rest.
    </h2>
</div>

<div class="flex flex-col gap-1 mb-5">
    <ApifyKeyInput />
    <a href="/token-info" class="underline opacity-70"
        >Learn more about the APIFY token</a
    >
</div>

<TwitterScraperSetup />
