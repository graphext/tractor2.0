<script lang="ts">
    import type { ApifyClient } from "$lib/apifyEndpoints";
    import Stop from "phosphor-svelte/lib/Stop";

    let stopping: boolean;

    export let apifyClient: ApifyClient;
    export let runId;

    $: stopButtonText = stopping ? "Aborting..." : "Stop";
</script>

<button
    on:click={async () => {
        stopping = true;
        if (runId) apifyClient.abortRun(runId);
    }}
    class="btn hover:btn-error btn-outline border-base-content/20 btn-sm"
    disabled={stopping}><Stop weight="fill" /> {stopButtonText}</button
>
