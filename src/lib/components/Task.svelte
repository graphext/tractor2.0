<script lang="ts">
    import { getRunsForTask } from "$lib/apifyEndpoints";
    import type { Task } from "$lib/types";

    export let task: Task;

    async function getRun() {
        const data = await getRunsForTask(task.id);
        console.log(data.data);
        return data.data;
    }
</script>

<div class="flex justify-between">
    <div class="flex flex-col gap-1 tabular-nums">
        <div>{task.name}</div>
        <div class="opacity-70">
            {task.actName}
        </div>

        <div class="opacity-60">
            {new Date(task.createdAt).toLocaleString("en-UK")}
        </div>
    </div>

    {#await getRun()}
        <div>loading</div>
    {:then runs}
        {#if runs.items.length > 0}
            {#each runs.items as run}
                <div class="flex flex-col text-right items-end justify-between">
                    {#if run.status == "SUCCEEDED"}
                        <div class="badge badge-outline badge-success">OK</div>
                    {:else if run.status == "RUNNING"}
                        <div class="badge badge-warning">{run.status}</div>
                    {:else if run.status == "FAILED" || run.status == "ABORTED"}
                        <div class="badge badge-error">{run.status}</div>
                    {/if}
                    <div class="tabular-nums">
                        ${run.usageTotalUsd.toFixed(4)}
                    </div>
                </div>
            {/each}
        {:else}
            <div>no runs</div>
        {/if}
    {/await}
</div>
