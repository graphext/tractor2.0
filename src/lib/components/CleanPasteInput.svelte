<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { cleanText } from "$lib/utils";
    import { apifyTerms } from "$lib/stores/userQueryStore";

    export let placeholder = "Paste your text here";
    export let value = "";

    $: if (value) apifyTerms.set(value);

    const dispatch = createEventDispatcher();

    function handlePaste(event: ClipboardEvent) {
        event.preventDefault();

        const pastedText = event.clipboardData?.getData("text") || "";
        const cleanedText = cleanText(pastedText);

        value = cleanedText;
        dispatch("input", cleanedText);
    }

    function handleInput(event: Event) {
        const input = event.target as HTMLTextAreaElement;
        value = cleanText(input.value);
        dispatch("input", value);
    }

    let textarea: HTMLTextAreaElement;

    $: value && textarea && (textarea.scrollTop = textarea.scrollHeight);
</script>

<textarea
    {placeholder}
    {value}
    bind:this={textarea}
    class="textarea border border-primary/70 w-full font-mono"
    rows="5"
></textarea>
