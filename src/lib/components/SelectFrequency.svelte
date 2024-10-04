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
    preventScroll={false}
    selected={options.find((e) => e.value === $frequencyStore)}
    onSelectedChange={(e) => {
        if (e) {
            $frequencyStore = e.label;
            selectedLabel = e.label;
            console.log("changed", $frequencyStore);
        }
    }}
    items={options}
>
    <div class="flex flex-col gap-1">
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
                class="bg-neutral z-10 shadow-md shadow-base-100 rounded-btn"
            >
                <div class="p-4 text-balance w-[250px]">
                    The more queries you send, the more results you'll get.
                </div>
            </Tooltip.Content>
        </Tooltip.Root>

        <Select.Trigger
            class="w-[220px] flex items-center pl-3 pr-2 py-1 bg-neutral h-full rounded-full"
            aria-label="Frequency"
        >
            <Timer size={24} />
            <Select.Value class="text-sm p-1.5 ml-1" placeholder="Frequency" />
        </Select.Trigger>
    </div>
    <Select.Content
        class="w-full backdrop-blur bg-base-200 rounded-xl shadow-md shadow-base-100 px-1 py-1 outline-none"
        transition={fly}
        transitionConfig={{ duration: 100, y: -20 }}
        sideOffset={8}
    >
        {#each options as o}
            <Select.Item
                class="flex justify-between h-7 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[disabled]:text-base-content/50"
                value={o.value}
                label={o.label}
                disabled={o.disabled}
            >
                {o.label}
                {#if selectedLabel === o.label}
                    <Check weight="regular" size={20} class="fill-primary" />
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
