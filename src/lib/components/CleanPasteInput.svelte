<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { cleanText } from "$lib/utils";

    export let placeholder = "";
    export let value = "";

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
</script>

<textarea
    {placeholder}
    bind:value
    bind:this={textarea}
    class="textarea border border-primary/70 w-full font-mono h-full overflow-x-scroll"
    rows="10"
    {...$$restProps}
></textarea>

<!-- lol, from https://bugzilla.mozilla.org/show_bug.cgi?id=1137650 -->
<style>
    textarea {
        white-space: pre;
        overflow: auto;
        word-wrap: normal;

        scrollbar-gutter: stable;
    }
</style>
