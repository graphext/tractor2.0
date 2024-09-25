<script lang="ts">
    import { Combobox } from 'bits-ui'

    export let options: { value: string; label: string }[] = []
    export let selected: { value: string; label: string }
    export let placeholder: string = 'Search...'

    let searchQuery = ''

    function handleSelect(option: { value: string; label: string }) {
        selected = option
        searchQuery = option.label
    }

    $: filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    )
</script>

<Combobox.Root {selected} items={filteredOptions} bind:inputValue={searchQuery}>
    <div class="">
        <Combobox.Input
            class="inline-flex h-10 truncate rounded-full bg-neutral px-3 text-sm transition-colors placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            {placeholder}
            on:click={() => (searchQuery = '')}
            aria-label={placeholder}
        />
    </div>
    <Combobox.Content
        class="w-full bg-base-100 p-1 shadow-lg border border-base-content/5 shadow-base-content/10 overflow-y-scroll max-h-[250px] rounded-xl"
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
