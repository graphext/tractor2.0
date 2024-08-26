<script lang="ts">
    import { userQuery } from "$lib/stores/userQueryStore";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import type { DateRange, Selected } from "bits-ui";
    import DatePicker from "./DatePicker.svelte";
    import { enrichQueries, getSelectionOptions } from "$lib/utils";
    import SelectFrequency from "./SelectFrequency.svelte";
    import SelectLists from "./SelectLists.svelte";
    import { CaretRight } from "phosphor-svelte";

    export let queries = "";
    export let enrichedQueries = "";
    let lists: Selected<string>[];

    const placeholderIdeas = [
        "tweets about chocolate with at least 10 likes",
        "tweets talking about cats but not dogs, that are not replies",
        "tweets including the term 'brand' but not the term 'design'",
        "tweets mentioning @user_name that are not replies",
        "mentions of 'space' and either 'big' or 'large', with images, excluding mentions of #asteroid",
    ];

    let index = 0;
    let placeholder = placeholderIdeas[index];

    let userPrompt = "";
    let error = "";
    let loading = false;

    let selectedRange: DateRange;
    let timeSteps: Date[];

    $: enrichedQueries = enrichQueries(
        queries,
        timeSteps,
        selectedRange,
        lists,
    ); // final result

    $: options = getSelectionOptions(selectedRange);

    let interval: Timeout;
    interval = setInterval(() => {
        index = (index + 1) % placeholderIdeas.length;
        placeholder = placeholderIdeas[index];
    }, 6000);

    onMount(() => {
        if ($userQuery) {
            userPrompt = $userQuery;
        }
    });

    async function generateResponse() {
        $userQuery = userPrompt;
        loading = true;
        error = "";
        queries = "";

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`,
                );
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                console.log(chunk);
                queries += chunk;
            }
        } catch (err) {
            console.error("Error:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            toast.error(error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex flex-col gap-3 mb-4">
    <div class="w-full flex gap-3">
        {#if loading}
            <span class="loading loading-ring loading-lg text-primary"></span>
        {/if}
        <form class="w-full">
            <div
                class="md:join w-full flex flex-col md:flex-row md:gap-0 gap-3"
            >
                <input
                    type="text"
                    class="input transition-all input-sm text-sm bg-neutral w-full join-item md:rounded-l-full"
                    bind:value={userPrompt}
                    {placeholder}
                />
                <button
                    on:click={generateResponse}
                    class="btn btn-primary font-normal btn-sm join-item md:rounded-r-full"
                    disabled={loading}
                >
                    {#if loading}
                        <span>Thinking...</span>
                    {:else}
                        <CaretRight weight="bold" size={20} />
                    {/if}
                </button>
            </div>
        </form>
    </div>
    {#if error}
        <div class="text-error">
            {error}
        </div>
    {/if}
</div>

<div class="flex items-start gap-3 w-full overflow-x-clip">
    <DatePicker bind:selectedRange bind:timeSteps />
    <SelectFrequency {options} />
    <SelectLists bind:lists />
</div>
