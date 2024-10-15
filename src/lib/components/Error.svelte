<script>
    export let error, userId, runId;
</script>

<div class="flex flex-col gap-3">
    <p class="w-1/2 text-balance">{error}</p>
    <a
        href="https://console.apify.com/organization/{userId}/actors/runs/{runId}#output"
        target="_blank"
        class:disabled={userId == undefined || runId == undefined}
        class="btn btn-xs w-fit btn-error">Go to run</a
    >
</div>
