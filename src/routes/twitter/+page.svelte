<script lang="ts">
    import type { DateRange } from "bits-ui";
    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import TwitterSearchOptions from "$lib/components/TwitterSearchOptions.svelte";

    import Section from "$lib/components/Section.svelte";

    let queries: string;
    let enrichedQueries: string;
    let selectedRange: DateRange;
    let frequency: DateRange;
</script>

<main class="flex flex-col gap-5">
    <Section>
        <div class="text-base-content/70 mb-4">QUERY GENERATION</div>
        <TwitterSearchOptions
            bind:selectedRange
            bind:queries
            bind:enrichedQueries
        />
    </Section>

    <Section>
        <div class="mb-4 text-base-content/70">APIFY</div>

        <ApifyScraper
            bind:queries
            {selectedRange}
            bind:queriesSpreadOverTime={enrichedQueries}
        />
    </Section>
</main>
