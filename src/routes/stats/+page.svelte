<script lang="ts">
  import { getActors, getRuns } from "$lib/apifyEndpoints";
  import type { ActorResponse, RunResponse } from "$lib/types";
  import { onMount } from "svelte";

  let actors: string[] = [];
  let runs: Record<string, number> = {};
  let totalRuns = 0;
  let loading = false;
  let mostUsedActor = { name: "", count: 0 };
  let totalMoneySpent = 0;
  let runsData: Record<string, Array<any>> = {};
  let actorCosts: Record<string, number> = {};

  $: {
    totalRuns = 0;
    totalMoneySpent = 0;

    for (const actor in runsData) {
      const items = runsData[actor];
      totalRuns += items.length;
      actorCosts[actor] = items
        .map((e) => e.usageTotalUsd)
        .reduce((acc, curr) => acc + curr, 0);
      totalMoneySpent += actorCosts[actor];
    }
  }

  onMount(async () => {
    loading = true;

    let actResponse: ActorResponse = await getActors();
    let userActors = actResponse.data;

    await Promise.all(
      userActors.items.map(async (actor) => {
        const runData = await getRuns(actor.id);
        if (runData.data.items.length > 0) {
          runsData[actor.name] = runData.data.items;
        }
      })
    );

    console.log("-----------");
    console.log(runsData);

    loading = false;
  });
</script>

<div>
  <h1>Stats</h1>
  <h2>Total runs: {totalRuns}</h2>
  <h2>Total money spent: ${totalMoneySpent.toFixed(2)}</h2>
  {#each Object.entries(runsData) as [actor, items]}
    <h2>{actor}: {items.length}</h2>
    <h2>${actorCosts[actor].toFixed(2)}</h2>
    <div class="divider"></div>
  {/each}
</div>

<div>
  Apify deletes your data <a
    class="text-primary underline"
    href="https://docs.apify.com/platform/storage/usage#data-retention"
    >after 7 days by default.</a
  >
</div>
