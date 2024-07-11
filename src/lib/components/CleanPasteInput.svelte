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
</script>

<textarea
    {placeholder}
    {value}
    on:paste={handlePaste}
    on:input={handleInput}
    class="textarea textarea-bordered w-full font-mono"
    rows="5"
></textarea>
