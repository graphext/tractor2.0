<script lang="ts">
    import { Select, Tooltip } from "bits-ui";
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
    <div class="flex flex-col">
        <Tooltip.Root openDelay={100}>
            <Tooltip.Trigger class="text-left">
                <Select.Label class="text-sm text-base-content/60"
                    >Break the queries down</Select.Label
                >
            </Tooltip.Trigger>
            <Tooltip.Content
                transition={fly}
                transitionConfig={{ y: 8, duration: 150 }}
                sideOffset={8}
                class="bg-base-100 z-10 shadow-md shadow-base-300 border border-primary rounded-btn"
            >
                <div class="p-3 text-balance w-[250px]">
                    The more queries you send, the more results you'll get.
                </div>
            </Tooltip.Content>
        </Tooltip.Root>

        <Select.Trigger
            class="w-[220px] flex items-center pl-3 pr-2 py-1 h-full border-primary border rounded-btn"
            aria-label="Frequency"
        >
            <Timer size={24} />
            <Select.Value class="text-sm p-1.5 ml-1" placeholder="Frequency" />
        </Select.Trigger>
    </div>
    <Select.Content
        class="w-full backdrop-blur bg-base-100/40 rounded-xl border border-primary shadow-md shadow-base-300 px-1 py-1 shadow-popover outline-none"
        transition={fly}
        transitionConfig={{ duration: 100, y: -20 }}
        sideOffset={8}
    >
        {#each options as o}
            <Select.Item
                class="flex justify-between h-10 w-full select-none items-center rounded-btn px-5 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-primary data-[highlighted]:text-secondary-content data-[highlighted]:font-bold data-[disabled]:text-base-content/50"
                value={o.value}
                label={o.label}
                disabled={o.disabled}
            >
                {o.label}
                {#if selectedLabel === o.label}
                    <Check weight="bold" size={20} />
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
