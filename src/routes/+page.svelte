<script lang="ts">
    import { MetaTags } from "svelte-meta-tags";
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";
    import Indicator from "$lib/components/Indicator.svelte";
    import User from "$lib/components/User.svelte";

    let queries: string;
    let queriesSpreadOverTime: string;
</script>

<MetaTags
    title="Tractor 2.0"
    description="Easiest way to Download & analyze Tweets"
    canonical="https://tractor.graphext.com"
    additionalLinkTags={[
        { rel: "icon", href: "/favicon-32x32.png" },
        { rel: "icon", href: "/favicon-16x16.png" },
        { rel: "apple-touch-icon", href: "apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
    ]}
    additionalMetaTags={[{ property: "theme-color", content: "#fff" }]}
    keywords={[
        "tweets",
        "analysis",
        "scraping",
        "apify",
        "graphext",
        "tractor",
    ]}
    openGraph={{
        url: "https://tractor.graphext.com",
        title: "Tractor 2.0",
        description: "Easiest way to Download & analyze Tweets",
        images: [
            {
                url: "https://tractor.graphext.com/ogimage.png",
                width: 1200,
                height: 600,
                alt: "Tractor",
            },
        ],
    }}
    twitter={{
        handle: "@graphext",
        cardType: "summary_large_image",
        title: "Tractor",
        description: "Easiest way to Download & analyze Tweets",
        image: "https://tractor.graphext.com/ogimage.png",
        imageAlt: "Tractor",
    }}
/>

<div class="mb-10">
    <div class="flex gap-3">
        <img src="/tractor_icon.svg" width="24" alt="" />
        <h1 class="text-3xl md:text-left transition-all tracking-tight">
            Tractor
        </h1>
    </div>

    <div class="flex justify-between items-baseline">
        <h2 class="text-balance md:text-left">
            Scraping made easy. Put your Apify key, and let us do the rest.
        </h2>
        <div class="">
            <User />
        </div>
    </div>
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
    <div class="font-bold mb-3 text-secondary dark:text-secondary">
        Query Generation
    </div>
    <ChatGPTQueries bind:queriesSpreadOverTime bind:queries />

    <Indicator color="secondary/80" index={2} />
</section>

<section
    id="apify"
    class="my-5 border border-primary/80 p-3 rounded-box relative"
>
    <div class="font-bold mb-3 text-primary dark:text-primary">APIFY</div>

    <ApifyScraper bind:queries bind:queriesSpreadOverTime />

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
