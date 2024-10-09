<script lang="ts">
    import { getTasks } from "$lib/apifyEndpoints";
    import TaskElement from "$lib/components/Task.svelte";
    import type { Task } from "$lib/types";
    import { apifyKey } from "$lib/stores/apifyStore";

    async function getUserTasks(): Promise<Task[]> {
        const data = await getTasks();

        const allTasks: Task[] = data.data.items;

        const userTasks = allTasks.filter((t: Task) => {
            return (
                $apifyKey.slice(-4) == t.name.split("-")[1] &&
                t.name.includes("TRCTR")
            );
        });

        userTasks.sort((b, a) => {
            return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );
        });

        return userTasks;
    }
</script>

<h1 class="mt-10 text-3xl font-bold mb-3">Tasks</h1>

{#await getUserTasks()}
    <div>loading...</div>
{:then tasks}
    Total tasks: <b>{tasks.length}</b>
    <ol class="my-10">
        {#each tasks as task, i}
            <li class="">
                <TaskElement {task} />
            </li>
            {#if i < tasks.length - 1}
                <div class="divider my-0"></div>
            {/if}
        {/each}
    </ol>
{/await}
