<script lang="ts">
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import Input from "$lib/components/Input.svelte";

    export let data;
    const apifyData = data.data;
    console.log(apifyData);

    let prompt = "";

    let value: string;
    let inputToken: string;

    let list: HTMLUListElement;
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
                const data = e.clipboardData.getData("text/plain");
                const noFormat = data.replaceAll("\t", "").trim();
                value = noFormat;
            }
        }}
    />

    <div class="sticky bottom-1 flex flex-col gap-1">
        <ApifyKeyInput />
        <a href="/token-info" class="underline opacity-70"
            >Learn more about the token</a
        >
    </div>
</form>
