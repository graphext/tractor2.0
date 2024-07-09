<script lang="ts">
    export let value: string = ''
    export let enter: string | undefined = undefined

    import { messages } from '../../store'

    let element: HTMLInputElement
    $: console.log(enter)

    function onEnter(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            enter = value
            value = ''
            $messages = [...$messages, enter]
        }
    }
</script>

<input
    type="text"
    class="input input-md input-bordered w-full"
    bind:value
    bind:this={element}
    placeholder="Type in the tweets you want to find"
    on:keydown={onEnter}
/>
