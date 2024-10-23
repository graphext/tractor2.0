<script>
    /**
     * @typedef {Object} Props
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props & { [key: string]: any }} */
    let { children, ...rest } = $props();
</script>

<div
    {...rest}
    class="p-4 rounded-box relative bg-base-200 outline-none shadow-sm border border-base-300/60"
>
    {@render children?.()}
</div>
