<script lang="ts">
    import Input from '$lib/components/Input.svelte'

    let prompt = ''

    let value: string
    let list: HTMLUListElement

    import { messages } from '../store'
</script>

<h1 class="text-xl font-bold text-center md:text-left">Tractor</h1>
<h2 class="w-1/2 md:w-full mx-auto text-center text-balance md:text-left">
    Scraping made easy. Put your Apify key, and let us do the rest.
</h2>

<div class="h-96 border overflow-y-scroll">
    <ul bind:this={list}>
        {#each $messages as m}
            <li>{m}</li>
        {/each}
    </ul>
</div>

<div class="sticky bottom-1">
    <Input bind:value />
</div>
