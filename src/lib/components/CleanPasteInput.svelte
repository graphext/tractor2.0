<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { cleanText } from "$lib/utils";

    interface Props {
        placeholder?: string;
        value?: string;
        [key: string]: any
    }

    let { placeholder = "", value = $bindable(""), ...rest }: Props = $props();

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

    let textarea: HTMLTextAreaElement = $state();
</script>

<textarea
    {placeholder}
    bind:value
    bind:this={textarea}
    class="textarea bg-neutral w-full font-mono h-full overflow-x-scroll shadow-sm"
    rows="6"
    {...rest}
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
