<script lang="ts">
    import { Select } from "bits-ui";
    import { fly } from "svelte/transition";
    import Check from "phosphor-svelte/lib/Check";
    import Timer from "phosphor-svelte/lib/Timer";

    import { frequencyStore } from "$lib/stores/store";

    let selectedLabel: string;

    export let options;
</script>

<Select.Root
    selected={options.find((e) => e.value === $frequencyStore)}
    onSelectedChange={(e) => {
        if (e) {
            $frequencyStore = e.label;
            selectedLabel = e.label;
        }
    }}
    items={options}
>
    <Select.Trigger
        class="w-[220px] flex items-center pl-3 pr-2 py-1 h-full border-secondary border rounded-btn"
        aria-label="Frequency"
    >
        <Timer size={24} />
        <Select.Value class="text-sm p-1.5 ml-1" placeholder="Frequency" />
    </Select.Trigger>
    <Select.Content
        class="w-full backdrop-blur bg-base-100/40 rounded-xl border border-secondary shadow-md shadow-base-content/10 px-1 py-1 shadow-popover outline-none"
        transition={fly}
        transitionConfig={{ duration: 100, y: -20 }}
        sideOffset={8}
    >
        {#each options as o}
            <Select.Item
                class="flex justify-between h-10 w-full select-none items-center rounded-btn px-5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-secondary data-[highlighted]:text-secondary-content data-[highlighted]:font-bold data-[disabled]:text-base-content/50"
                value={o.value}
                label={o.label}
                disabled={o.disabled}
            >
                {o.label}
                {#if selectedLabel === o.label}
                    <Check
                        weight="bold"
                        size={20}
                        class="fill-secondary-content"
                    />
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
