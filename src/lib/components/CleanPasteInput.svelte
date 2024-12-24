<script lang="ts">
    interface Props {
        placeholder?: string;
        value?: string;
        [key: string]: any;
    }

    let { placeholder = "", value = $bindable(), ...rest }: Props = $props();

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
