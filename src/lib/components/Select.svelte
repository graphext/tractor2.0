<script lang="ts">
    import { Select } from 'bits-ui'
    import { fly } from 'svelte/transition'
    import Check from 'phosphor-svelte/lib/Check'
    import Timer from 'phosphor-svelte/lib/Timer'

    import {
        utcDay,
        utcWeek,
        utcMonth,
        utcYear,
        type CountableTimeInterval
    } from 'd3-time'

    export let value: CountableTimeInterval = utcDay
    let selectedLabel = 'Daily'

    // export let options
    const options = [
        { value: utcDay, label: 'Daily' },
        { value: utcWeek, label: 'Weekly' },
        { value: utcMonth, label: 'Monthly' },
        { value: utcYear, label: 'Anually' }
    ]
</script>

<Select.Root items={options}>
    <Select.Trigger
        class="w-[220px] flex items-center pl-3 pr-2 py-1 h-full border-secondary border rounded-btn"
        aria-label="Frequency"
    >
        <Timer size={24} />
        <Select.Value class="text-sm p-1.5" placeholder="Frequency" />
    </Select.Trigger>
    <Select.Content
        class="w-full rounded-xl border border-secondary shadow-md shadow-base-content/10 bg-base-100 px-1 py-1 shadow-popover outline-none"
        transition={fly}
        transitionConfig={{ duration: 100, y: -20 }}
        sideOffset={8}
    >
        {#each options as o}
            <Select.Item
                class="flex h-10 w-full select-none items-center rounded-btn px-5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[highlighted]:font-bold"
                value={o.value}
                label={o.label}
                on:click={() => {
                    value = o.value
                    selectedLabel = o.label
                }}
            >
                {o.label}
                {#if selectedLabel == o.label}
                    <Select.ItemIndicator class="ml-auto" asChild={false}>
                        <Check size={20} class="fill-secondary" />
                    </Select.ItemIndicator>
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
