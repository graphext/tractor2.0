<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    import { cleanText } from '$lib/utils'
    import { apifyTerms } from '$lib/stores/userQueryStore'

    export let placeholder = 'Paste your text here'
    export let value = ''

    $: if (value) apifyTerms.set(value)

    const dispatch = createEventDispatcher()

    function handlePaste(event: ClipboardEvent) {
        event.preventDefault()

        const pastedText = event.clipboardData?.getData('text') || ''
        const cleanedText = cleanText(pastedText)

        value = cleanedText
        dispatch('input', cleanedText)
    }

    function handleInput(event: Event) {
        const input = event.target as HTMLTextAreaElement
        value = cleanText(input.value)
        dispatch('input', value)
    }

    let textarea: HTMLTextAreaElement

    $: value && textarea && (textarea.scrollTop = textarea.scrollHeight)
</script>

<textarea
    {placeholder}
    {value}
    bind:this={textarea}
    class="textarea border border-primary/70 w-full font-mono h-full overflow-x-scroll"
    rows="10"
></textarea>

<!-- lol, from https://bugzilla.mozilla.org/show_bug.cgi?id=1137650 -->
<style>
    textarea {
        white-space: pre;
        overflow: auto;
        word-wrap: normal;
    }
</style>
