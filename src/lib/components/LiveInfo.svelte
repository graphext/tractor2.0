<script lang="ts">
    import { type ApifyClient } from "$lib/apifyEndpoints";
    import Error from "./Error.svelte";
    import LiveTable from "./LiveTable.svelte";
    import ResumeButton from "./ResumeButton.svelte";
    import Status from "./Status.svelte";
    import StopButton from "./StopButton.svelte";

    export let error: string;
    export let status: string;
    export let apifyClient: ApifyClient;
    export let resuming: boolean;
    export let runId: string;
    export let userId: string;
    export let headers: string[];
    export let rows: string[][];
    export let outputProgress: number;
</script>

{#if error || status}
    <div>
        <div class="divider mt-3 mb-3" />

        <div class="flex flex-col gap-5">
            <div class="flex justify-between items-baseline">
                {#if status == "RUNNING" || status == "ABORTING"}
                    <StopButton {apifyClient} {runId} />
                {/if}

                {#if status == "ABORTED" || status == "READY"}
                    <ResumeButton
                        {status}
                        bind:resuming
                        {apifyClient}
                        {runId}
                    />
                {/if}

                {#if error}
                    <Error {error} {userId} {runId} />
                {:else}
                    <p class="opacity-0">error</p>
                {/if}

                {#if status}
                    <Status {status} {outputProgress} />
                {/if}
            </div>

            <LiveTable {headers} {rows} />
        </div>
    </div>
{/if}
