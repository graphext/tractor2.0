<script lang="ts">
    import { Tooltip } from "bits-ui";
    import { fly } from "svelte/transition";
    interface Props {
        children?: import('svelte').Snippet;
        [key: string]: any
    }

    let { ...props }: Props = $props();
</script>

<Tooltip.Content {...props} transition={fly}>
    <div
        class="px-4 py-3 bg-neutral border border-base-content/20 flex flex-col gap-1 rounded-box max-w-96 list-disc list-inside text-sm shadow-md"
    >
        {@render props.children?.()}
    </div>
</Tooltip.Content>
