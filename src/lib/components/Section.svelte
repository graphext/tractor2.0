<script lang="ts">
    interface Props {
        children?: import('svelte').Snippet;
        [key: string]: any
    }

    let { children, ...rest }: Props = $props();
</script>

<div
    {...rest}
    class="p-4 rounded-box relative bg-base-200 outline-none shadow-sm border border-base-300/60"
>
    {@render children?.()}
</div>
