<script lang="ts">
    import { Combobox, type Selected } from "bits-ui";
    import { fly } from "svelte/transition";

    export let options: Selected<string>[] = [];
    export let selected: Selected<string>;
    export let placeholder: string = "Search...";

    let searchQuery = "";

    function handleSelect(option: { value: string; label: string }) {
        selected = option;
        searchQuery = option.label;
    }

    function onBlur() {
        searchQuery = selected.label;
    }

    $: filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
</script>

<div class:disabled={$$props["disabled"]}>
    <Combobox.Root
        preventScroll={false}
        onSelectedChange={(e) => {
            if (e) selected = e;
        }}
        {selected}
        items={filteredOptions}
        bind:inputValue={searchQuery}
        onOutsideClick={onBlur}
    >
        <Combobox.Input
            class="inline-flex w-full input input-sm truncate rounded-full bg-neutral px-3 text-sm focus:outline-none focus:ring-2 focus:ring-base-300 focus:ring-offset-neutral"
            placeholder={$$props["placeholder"]}
            on:click={() => (searchQuery = "")}
            aria-label={placeholder}
        />
        <Combobox.Content
            side={$$props["side"] ? $$props["side"] : "bottom"}
            transition={fly}
            transitionConfig={{ y: 10, duration: 300 }}
            class="w-full combo-content bg-base-200 p-1 shadow-md border border-base-content/10 overflow-y-scroll max-h-[250px] rounded-xl"
        >
            {#each filteredOptions as option (option.value)}
                <Combobox.Item
                    class="flex justify-between h-7 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[disabled]:text-base-content/50"
                    value={option.value}
                    label={option.label}
                    on:click={() => handleSelect(option)}
                >
                    {option.label}
                </Combobox.Item>
            {:else}
                <span class="block px-5 py-2 text-sm text-error">
                    No results found
                </span>
            {/each}
        </Combobox.Content>
        <Combobox.Arrow />
        <Combobox.HiddenInput name="selectedOption" />
    </Combobox.Root>
</div>

<style>
    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
