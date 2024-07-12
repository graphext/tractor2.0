<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";

    let queries: string;
</script>

<head>
    <title>Tractor 2.0 — Download Tweets Easily/title> </title>

    <link
        rel="icon"
        href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚜</text></svg>"
    />
</head>

<div class="mb-10">
    <div class="flex justify-between items-baseline">
        <h1
            class="text-3xl font-bold md:text-left transition-all tracking-tight"
        >
            Tractor
        </h1>
        <a
            class="underline text-primary"
            target="_blank"
            href="https://console.apify.com/actors/runs">APIFY Runs Dashboard</a
        >
    </div>
    <h2 class="w-full mx-auto text-balance md:text-left">
        Scraping made easy. Put your Apify key, and let us do the rest.
    </h2>
</div>

<section id="gpt" class="my-5 border-secondary/30 border p-3 rounded-box">
    <div class="font-bold mb-3 opacity-60 text-secondary">Query Generation</div>
    <ChatGPTQueries bind:queries />
</section>

<section id="apify" class="my-5 border border-primary/30 p-3 rounded-box">
    <div class="font-bold mb-3 opacity-60 text-primary">APIFY</div>
    <div class="flex flex-col gap-1 mb-5">
        <ApifyKeyInput />

        {#if !$apifyKey}
            <a href="/token-info" class="underline opacity-70"
                >Learn more about the APIFY token</a
            >
        {/if}
    </div>

    <ApifyScraper bind:queries />
</section>

<style>
    h1 {
        font-variation-settings: "ital" 12;
    }
    h1:hover {
        font-variation-settings: "ital" 0;
    }
</style>
