<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import { cleanText } from "$lib/utils.js";
    import Input from "$lib/components/Input.svelte";

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let data;
    const apifyData = data.data;
    console.log(apifyData);

    let value: string;
</script>

<div class="mb-10">
    <h1 class="text-xl font-bold text-center md:text-left">Tractor</h1>
    <h2 class="w-1/2 md:w-full mx-auto text-center text-balance md:text-left">
        Scraping made easy. Put your Apify key, and let us do the rest.
    </h2>
</div>

<form class="flex flex-col justify-between h-[800px] gap-3">
    <textarea
        class="textarea textarea-bordered grow border overflow-y-scroll rounded"
        bind:value
        on:paste={(e) => {
            if (e.clipboardData) {
                e.preventDefault();

                const text = e.clipboardData.getData("text/plain");
                const noFormat = cleanText(text);

                value = noFormat;
                dispatch("textarea", noFormat);
            }
        }}
    />

    <div class="sticky bottom-1 flex flex-col gap-1">
        <ApifyKeyInput />
        <a href="/token-info" class="underline opacity-70"
            >Learn more about the APIFY token</a
        >
    </div>
</form>
