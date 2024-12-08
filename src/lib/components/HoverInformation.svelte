<script lang="ts">
    import { Tooltip } from "bits-ui";
    import TooltipContent from "./TooltipContent.svelte";

    interface Props {
        icon: any;
        size?: number;
        side?: string;
        sideOffset?: number;
        transitionConfig?: any;
        children?: import('svelte').Snippet;
    }

    let {
        icon,
        size = 20,
        side = "right",
        sideOffset = 30,
        transitionConfig = { duration: 100, x: -5 },
        children
    }: Props = $props();
</script>

<Tooltip.Root openDelay={0}>
    <Tooltip.Trigger class="w-fit">
        {@const SvelteComponent = icon}
        <SvelteComponent
            {size}
            weight="bold"
            class="rounded-full bg-neutral border-2 border-base-300"
        />
    </Tooltip.Trigger>
    <TooltipContent {side} {sideOffset} {transitionConfig}>
        {@render children?.()}
    </TooltipContent>
</Tooltip.Root>
