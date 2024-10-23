<script>
    let { status, outputProgress } = $props();
</script>

<div
    class="flex gap-3 justify-end items-end opacity-30 tabular-nums text-right"
>
    <p class="mt-4">Task status: {status}</p>
    {#if status == "RUNNING"}
        <span>{outputProgress} results downloaded...</span>
        <span class="loading loading-dots loading-sm"></span>
    {:else if status == "SUCCEEDED"}
        <span></span>
    {:else if status == "FAILED"}
        <span> </span>
    {/if}
</div>
