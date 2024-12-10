<script lang="ts">
    import type { ApifyClient } from "$lib/apifyEndpoints";
    import Play from "phosphor-svelte/lib/Play";

    interface Props {
        resuming: boolean;
        apifyClient: ApifyClient;
        runId: any;
        status: any;
    }

    let {
        resuming = $bindable(),
        apifyClient,
        runId,
        status
    }: Props = $props();

    let resumeButtonText = $derived(resuming ? "Resuming..." : "Resume");
</script>

<button
    onclick={async () => {
        resuming = true;
        if (runId) apifyClient.resurrectRun(runId);
    }}
    class="btn hover:btn-accent btn-outline border-base-content/20 btn-sm"
    disabled={resuming}><Play weight="fill" /> {resumeButtonText}</button
>
