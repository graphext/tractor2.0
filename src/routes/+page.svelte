<script lang="ts">
    import type { DateRange } from "bits-ui";
    import ApifyScraper from "$lib/components/TwitterScraperSetup.svelte";
    import TwitterSearchOptions from "$lib/components/TwitterSearchOptions.svelte";
    import { today, getLocalTimeZone } from "@internationalized/date";

    import Section from "$lib/components/Section.svelte";

    let queries: string = $state("");
    let enrichedQueries: string = $state("");
    let selectedRange: DateRange = $state({
        start: today(getLocalTimeZone()).subtract({ months: -1 }),
        end: today(getLocalTimeZone()),
    });

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
