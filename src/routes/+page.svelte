<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";

    import TwitterScraperSetup from "$lib/components/TwitterScraperSetup.svelte";

    import { apifyKey } from "$lib/stores/apifyStore";
</script>

<div class="mb-10">
    <div class="flex justify-between">
        <h1 class="text-xl font-bold md:text-left">Tractor</h1>
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

<div class="flex flex-col gap-1 mb-5">
    <ApifyKeyInput />

    {#if !$apifyKey}
        <a href="/token-info" class="underline opacity-70"
            >Learn more about the APIFY token</a
        >
    {/if}
</div>

<TwitterScraperSetup />
