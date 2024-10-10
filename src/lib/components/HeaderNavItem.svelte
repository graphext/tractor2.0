<script lang="ts">
    import { Tooltip } from "bits-ui";
    import TooltipContent from "./TooltipContent.svelte";

    export let icon;
    export let url: string;
    export let tooltipContent: string;
</script>

<div class="mx-1">
    <Tooltip.Root openDelay={30}>
        <Tooltip.Trigger>
            <a
                target={url.startsWith("/") ? "_self" : "_blank"}
                class="btn btn-circle btn-ghost border border-base-content/10 shadow-sm text-base-content/60 hover:text-base-content/80"
                href={url}
            >
                <svelte:component this={icon} size={24} weight="bold"
                ></svelte:component>
            </a>
        </Tooltip.Trigger>

        <TooltipContent transitionConfig={{ duration: 100, y: -5 }}>
            {tooltipContent}
        </TooltipContent>
    </Tooltip.Root>
</div>
