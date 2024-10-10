<script lang="ts">
    import { getPrivateUserData, getRunsForTask } from "$lib/apifyEndpoints";
    import type { Task } from "$lib/types";
    import { onMount } from "svelte";
    import User from "./User.svelte";

    export let task: Task;

    async function getRun() {
        const data = await getRunsForTask(task.id);
        return data.data;
    }

    let userId: string | undefined;

    onMount(async () => {
        const data = await getPrivateUserData();
        userId = data.data.id;
    });
</script>

<div class="my-3">
    <div class="flex flex-col gap-1 tabular-nums mb-4">
        <div class="font-bold text-primary underline">
            <a
                href={`https://console.apify.com/organization/${userId}/actors/tasks/${task.id}/runs`}
                target="_blank">{task.name}</a
            >
        </div>
        <div class="opacity-70">
            {task.actName}
        </div>

        <div class="opacity-60">
            {new Date(task.createdAt).toLocaleString("en-UK")}
        </div>
    </div>

    {#await getRun()}
        <div>loading...</div>
    {:then runs}
        {#if runs.items.length > 0}
            <div class="flex w-fit gap-3 overflow-x-scroll">
                {#each runs.items as run, i}
                    <a
                        class="btn font-normal border border-base-300 shadow-sm h-fit flex flex-col items-start p-3 w-min"
                        target="_blank"
                        href={`https://console.apify.com/organization/${userId}/actors/tasks/${task.id}/runs/${run.id}#output`}
                    >
                        <div>Run {i + 1}</div>
                        {#if run.status == "SUCCEEDED"}
                            <div class="badge badge-success">OK</div>
                        {:else if run.status == "RUNNING"}
                            <div class="badge badge-warning">
                                {run.status}
                            </div>
                        {:else if run.status == "FAILED" || run.status == "ABORTED"}
                            <div class="badge badge-error">
                                {run.status}
                            </div>
                        {/if}
                        <div class="tabular-nums">
                            ${run.usageTotalUsd.toFixed(4)}
                        </div>
                    </a>
                {/each}
            </div>
        {:else}
            <div>No runs executed for this task</div>
        {/if}
    {/await}
</div>
