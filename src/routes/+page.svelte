<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";
    import Indicator from "$lib/components/Indicator.svelte";

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
    </div>
    <h2 class="w-full mx-auto text-balance md:text-left">
        Scraping made easy. Put your Apify key, and let us do the rest.
    </h2>
</div>

<section class="my-5 border-base-content/50 border p-3 rounded-box relative">
    <ApifyKeyInput />
    <Indicator color="base-content" index={1} />

    {#if !$apifyKey}
        <div class="mt-5 pl-1 hover:text-primary transition-colors">
            <a href="/token-info" class="underline opacity-70"
                >Learn more about the APIFY token</a
            >
        </div>
    {/if}
</section>

<section
    id="gpt"
    class="my-5 border-secondary dark:border-secondary/50 border p-3 rounded-box relative"
>
    <div class="font-bold mb-3 text-secondary dark:text-secondary-content">
        Query Generation
    </div>
    <ChatGPTQueries bind:queries />

    <Indicator color="secondary" index={2} />
</section>

<section
    id="apify"
    class="my-5 border border-primary/50 p-3 rounded-box relative"
>
    <div class="font-bold mb-3 text-primary dark:text-primary">APIFY</div>

    <ApifyScraper bind:queries />

    <Indicator index={3} />
</section>

<style>
    h1 {
        font-variation-settings: "ital" 12;
    }
    h1:hover {
        font-variation-settings: "ital" 0;
    }
</style>
