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
                class="btn btn-circle btn-ghost"
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
