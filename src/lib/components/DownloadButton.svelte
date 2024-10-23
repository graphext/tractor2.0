<script>
    let {
        csvBlob,
        filename,
        datasetSize,
        loading
    } = $props();
</script>

{#if csvBlob && filename}
    <a
        href={URL.createObjectURL(csvBlob)}
        download={filename}
        class:disabled={loading}
        class="btn btn-outline btn-primary w-full mt-5 group rounded-full"
        >Download Dataset <span
            class="font-mono badge badge-primary badge-xs group-hover:badge-warning"
            >.csv</span
        >
        {#if datasetSize}
            — {datasetSize} rows
        {/if}
    </a>
{/if}
