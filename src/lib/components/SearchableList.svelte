<script lang="ts">
    import { Combobox } from "bits-ui";

    interface Props {
        options: { value: string; label: string }[];
        selected: { value: string; label: string };
        placeholder: string;
        disabled: boolean;
    }

    let {
        options = [],
        selected,
        placeholder = "Search...",
        disabled,
    }: Props = $props();

    let searchQuery = $state("");

    function handleSelect(option: { value: string; label: string }) {
        selected = option;
        searchQuery = option.label;
    }

    function onBlur() {
        searchQuery = selected.label;
    }

    let filteredOptions = $derived(
        options.filter((option) =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
    );
</script>

<div class:disabled>
    <Combobox.Root
        preventScroll={false}
        {selected}
        items={filteredOptions}
        bind:inputValue={searchQuery}
        onOutsideClick={onBlur}
    >
        <Combobox.Input
            class="inline-flex w-full h-10 truncate rounded-full bg-neutral px-3 text-sm  placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-base-300 focus:ring-offset-neutral"
            {placeholder}
            on:click={() => (searchQuery = "")}
            aria-label={placeholder}
        />
        <Combobox.Content
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
