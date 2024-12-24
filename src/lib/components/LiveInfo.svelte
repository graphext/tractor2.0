<script lang="ts">
    import { type ApifyClient } from "$lib/apifyEndpoints";
    import { onMount } from "svelte";
    import Error from "./Error.svelte";
    import LiveTable from "./LiveTable.svelte";
    import ResumeButton from "./ResumeButton.svelte";
    import Status from "./Status.svelte";
    import StopButton from "./StopButton.svelte";

    interface Props {
        error: string;
        status: string;
        apifyClient: ApifyClient;
        resuming: boolean;
        runId: string;
        userId: string;
        headers: string[];
        rows: string[][];
        outputProgress: number;
    }

    let {
        error,
        status,
        apifyClient,
        resuming = $bindable(),
        runId,
        userId,
        headers,
        rows,
        outputProgress
    }: Props = $props();
</script>

{#if error || status}
    <div class="flex flex-col gap-5">
        <div class="divider"></div>

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

                {#if status}
                    <Status {status} {outputProgress} />
                {/if}
            </div>

            <LiveTable {headers} {rows} />
        </div>

        {#if error}
            <Error {error} {userId} {runId} />
        {:else}
            <p class="opacity-0">error</p>
        {/if}
    </div>
{/if}
