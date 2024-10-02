<script lang="ts">
    export let value: string = "";
    export let enter: string | undefined = undefined;
    export let placeholder = "";

    let element: HTMLInputElement;
</script>

<input
    type="text"
    class="input input-sm text-sm bg-neutral w-full rounded-full"
    bind:value
    bind:this={element}
    {placeholder}
    {...$$props}
/>
