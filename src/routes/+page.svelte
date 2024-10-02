<script lang="ts">
    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import ChatGPTQueries from "$lib/components/ChatGPTQueries.svelte";

    import Section from "$lib/components/Section.svelte";

    let queries: string;
    let enrichedQueries: string;
</script>

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
