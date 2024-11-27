<script lang="ts">
    import type { ApifyClient } from "$lib/apifyEndpoints";
    import Play from "phosphor-svelte/lib/Play";

    export let resuming: boolean;
    export let apifyClient: ApifyClient;
    export let runId;
    export let status;

    $: resumeButtonText = resuming ? "Resuming..." : "Resume";
</script>

<button
    on:click={async () => {
        resuming = true;
        if (runId) apifyClient.resurrectRun(runId);
    }}
    class="btn hover:btn-accent btn-outline border-base-content/20 btn-sm"
    disabled={resuming}><Play weight="fill" /> {resumeButtonText}</button
>
