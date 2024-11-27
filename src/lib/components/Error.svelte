<script>
    import { slide } from "svelte/transition";

    export let error, userId, runId;
</script>

<div
    class="flex flex-col gap-3 border border-error rounded-box p-3"
    transition:slide
>
    <p class="text-balance">{error}</p>
    <a
        href="https://console.apify.com/organization/{userId}/actors/runs/{runId}#output"
        target="_blank"
        class:disabled={userId == undefined || runId == undefined}
        class="btn btn-xs w-fit btn-error">Go to run</a
    >
</div>
