<script>
    import { Tooltip } from "bits-ui";
    import TooltipContent from "./TooltipContent.svelte";

    export let icon;
    export let size = 20;
    export let side = "right";
    export let sideOffset = 30;
    export let transitionConfig = { duration: 100, x: -5 };
</script>

<Tooltip.Root openDelay={0}>
    <Tooltip.Trigger class="w-fit">
        <svelte:component
            this={icon}
            {size}
            weight="bold"
            class="rounded-full bg-neutral border-2 border-base-300"
        />
    </Tooltip.Trigger>
    <TooltipContent {side} {sideOffset} {transitionConfig}>
        <slot />
    </TooltipContent>
</Tooltip.Root>
