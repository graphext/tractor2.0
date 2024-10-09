<script lang="ts">
    import { Select, Tooltip, type Selected } from "bits-ui";
    import { fly } from "svelte/transition";
    import Check from "phosphor-svelte/lib/Check";
    import { MagnifyingGlass } from "phosphor-svelte";
    import { Placeholder } from "phosphor-svelte";
    import TooltipContent from "./TooltipContent.svelte";

    export let selected: Selected<string>;

    export let options;

    export let label = "Select an option";
    export let tooltipContent: string | null = null;
</script>

<Select.Root
    disabled={$$props["disabled"]}
    preventScroll={false}
    bind:selected
    items={options}
>
    <div class="flex flex-col gap-1">
        {#if tooltipContent}
            <Tooltip.Root openDelay={100}>
                <Tooltip.Trigger class="text-left">
                    <Select.Label class="text-sm text-base-content/60"
                        >{label}</Select.Label
                    >
                </Tooltip.Trigger>
                <TooltipContent
                    transitionConfig={{ y: 8, duration: 150 }}
                    sideOffset={8}
                >
                    {tooltipContent}
                </TooltipContent>
            </Tooltip.Root>
        {:else}
            <Select.Label class="text-sm text-base-content/60"
                >{label}</Select.Label
            >
        {/if}

        <Select.Trigger
            class="w-[220px] flex items-center pl-3 pr-2 py-1 bg-neutral h-full rounded-full"
            aria-label={label}
        >
            <MagnifyingGlass />
            <Select.Value
                class="text-sm p-1.5 ml-1"
                placeholder={$$props["placeholder"]
                    ? $$props["placeholder"]
                    : label}
            />
        </Select.Trigger>
    </div>
    <Select.Content
        class="w-full backdrop-blur bg-base-200 rounded-xl shadow-md  border border-base-content/10 px-1 py-1 outline-none"
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
                {#if selected?.label === o.label}
                    <Check weight="regular" size={20} class="fill-primary" />
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
