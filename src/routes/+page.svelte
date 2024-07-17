<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";
    import Indicator from "$lib/components/Indicator.svelte";

    let queries: string;
</script>

<head>
    <title>Tractor 2.0 — Download Tweets Easily</title>

    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/site.webmanifest" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#25272e" />
    <meta name="msapplication-TileColor" content="#25272e" />
    <meta name="theme-color" content="#25272e" />

    <meta property="og:image" content="/ogimage.png" />
</head>

<div class="mb-10">
    <div class="flex justify-between items-baseline">
        <div class="flex gap-3">
            <img src="/tractor_icon.svg" width="24" alt="" />
            <h1 class="text-3xl md:text-left transition-all tracking-tight">
                Tractor
            </h1>
        </div>
    </div>
    <h2 class="w-full mx-auto text-balance md:text-left">
        Scraping made easy. Put your Apify key, and let us do the rest.
    </h2>
</div>

<section class="my-5 border-base-content/50 border p-3 rounded-box relative">
    <ApifyKeyInput />
    <Indicator color="base-content/50" index={1} />

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
    class="my-5 border-secondary/80 border p-3 rounded-box relative"
>
    <div class="font-bold mb-3 text-secondary dark:text-secondary-content">
        Query Generation
    </div>
    <ChatGPTQueries bind:queries />

    <Indicator color="secondary/80" index={2} />
</section>

<section
    id="apify"
    class="my-5 border border-primary/80 p-3 rounded-box relative"
>
    <div class="font-bold mb-3 text-primary dark:text-primary">APIFY</div>

    <ApifyScraper bind:queries />

    <Indicator color="primary/80" index={3} />
</section>

<style>
    h1 {
        font-variation-settings:
            "ital" 12,
            "wdth" 125,
            "wght" 600;
    }
    h1:hover {
        font-variation-settings:
            "ital" 0,
            "wdth" 125,
            "wght" 600;
    }
</style>
