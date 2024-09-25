<script lang="ts">
    export let value: string = ''
    export let enter: string | undefined = undefined
    export let placeholder = ''

    let element: HTMLInputElement

    function onEnter(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            enter = value
            value = ''
        }
    }
</script>

<input
    type="text"
    class="input transition-all input-sm text-sm bg-neutral w-full rounded-full"
    bind:value
    bind:this={element}
    {placeholder}
    on:keydown={onEnter}
/>
