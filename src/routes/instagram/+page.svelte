<script lang="ts">
    import DatePicker from "$lib/components/DatePicker.svelte";
    import Input from "$lib/components/Input.svelte";
    import Section from "$lib/components/Section.svelte";
    import Select from "$lib/components/Select.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";

    import { type DateValue } from "@internationalized/date";
    import type { Selected } from "bits-ui";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let keywords = "";
    let loading: boolean = false;
    let maxItems = 5000;
    let confirmChoice = false;

    $: buttonText = loading
        ? `Loading ${selected.label}`
        : `Get ${selected.label}`;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    function processInstagramInput(keywords: string) {
        const userNames = keywords.split(",").map((u) => {
            switch (true) {
                case u.startsWith("@"):
                    return `https://instagram.com/${u.trim().replace("@", "")}`;
                case u.startsWith("#"):
                    return `https://www.instagram.com/explore/search/keyword/?q=%23${u.trim().replace("#", "")}`;
                default:
                    return `https://www.instagram.com/explore/search/keyword/?q=%23${u.trim().replace("#", "")}`;
            }
        });
        console.log(userNames);

        return userNames;
    }
    function handleSubmit() {
        processInstagramInput(keywords);
    }

    let selectedDate: DateValue;

    let options: Selected<string>[] = [
        { label: "Posts", value: "posts" },
        { label: "Comments", value: "comments" },
        { label: "Details", value: "details" },
        { label: "Mentions", value: "mentions" },
        { label: "Reels", value: "stories" },
    ];
    let selected = options[0];
</script>

<Section>
    <form class="flex flex-col gap-5" on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="keywords" class="text-sm text-base-content/60"
                >Keywords:</label
            >
            <Input
                bind:value={keywords}
                id="keywords"
                placeholder="Enter instagram usernames separated by commas that you want to explore"
                disabled={loading}
            />
        </div>

        <div class="flex gap-5 items-center">
            <div class="w-fit">
                <DatePicker
                    label={"Search posts newer than"}
                    bind:selectedDate
                />
            </div>

            <div>
                <Select
                    label="What to search for"
                    bind:selected
                    tooltipContent={"You can choose to get posts, comments or details from Instagram URLs. Comments can only be scraped from post URLs."}
                    placeholder="Search mode"
                    {options}
                />
            </div>

            <div class="flex flex-col gap-1">
                <label for="maxItems" class="text-sm text-base-content/60"
                    >Posts to search for:</label
                >
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral"
                    inputmode="numeric"
                    type="number"
                    id="maxItems"
                    disabled={loading}
                    bind:value={maxItems}
                    placeholder="Enter maximum number of items"
                />
            </div>
        </div>

        <div class="w-full relative">
            {#if loading}
                <progress
                    class="progress-overlay mix-blend-overlay absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            {#if !confirmChoice}
                <button
                    on:click={() => (confirmChoice = true)}
                    class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                    disabled={!$apifyKey || !keywords}
                >
                    {#if loading}
                        <span class="loading loading-ring"></span>
                    {/if}
                    {buttonText}
                </button>
            {:else}
                <WarningCost unitPrice={2.3 / 1000} {maxItems} />
                <button
                    on:click={handleSubmit}
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !keywords}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>
</Section>
