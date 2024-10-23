<script lang="ts">
    import type { ApifyClient } from "$lib/apifyEndpoints";
    import Stop from "phosphor-svelte/lib/Stop";

    let stopping: boolean = $state();

    interface Props {
        apifyClient: ApifyClient;
        runId: any;
    }

    let { apifyClient, runId }: Props = $props();

    let stopButtonText = $derived(stopping ? "Aborting..." : "Stop");
</script>

<button
    onclick={async () => {
        stopping = true;
        if (runId) apifyClient.abortRun(runId);
    }}
    class="btn btn-error btn-sm"
    disabled={stopping}><Stop weight="fill" /> {stopButtonText}</button
>
