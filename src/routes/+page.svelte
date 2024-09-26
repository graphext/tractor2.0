<script lang="ts">
    import { MetaTags } from "svelte-meta-tags";

    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import Section from "$lib/components/Section.svelte";

    let queries: string;
    let enrichedQueries: string;
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
                url: "https://tractor.graphext.com/ogimage.webp",
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
        image: "https://tractor.graphext.com/ogimage.webp",
        imageAlt: "Tractor",
    }}
/>

<main class="flex flex-col gap-5">
    <Section>
        <div class="text-base-content/70 mb-4">QUERY GENERATION</div>
        <ChatGPTQueries bind:queries bind:enrichedQueries />
    </Section>

    <Section>
        <div class="mb-4 text-base-content/70">APIFY</div>

        <ApifyScraper
            bind:queries
            bind:queriesSpreadOverTime={enrichedQueries}
        />
    </Section>
</main>
