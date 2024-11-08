<script lang="ts">
  import { getActors, getRuns } from "$lib/apifyEndpoints";
  import type { ActorResponse, RunResponse } from "$lib/types";
  import { onMount } from "svelte";

  let actors: string[] = [];
  let totalRuns = 0;
  let mostUsedActor = { name: "", count: 0 };
  let totalMoneySpent = 0;

  onMount(async () => {
    let actResponse: ActorResponse = await getActors();

    let userActors = actResponse.data;

    for (const actor of userActors.items) {
      actors.push(actor.name);

      const response: RunResponse = await getRuns(actor.id);
      const runsData = response.data;

      for (const run of runsData.items) {
        totalMoneySpent += run.usageTotalUsd;
        totalRuns++;
      }

      //   await new Promise((resolve) => setTimeout(resolve, 300));
    }
  });
</script>

<div class="stats-block">
  <div class="stats-item">
    <h2 class="text-lg">Total money spent</h2>
    <p>${totalMoneySpent.toFixed(2)}</p>
    <p>{totalRuns}</p>
  </div>
  <div class="stats-item">
    <h2 class="text-lg">Most used actor</h2>
    <p>{mostUsedActor.name} - {mostUsedActor.count} times</p>
  </div>
</div>

<style>
  .stats-block {
    @apply flex flex-col gap-5 p-5;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .stats-item {
    @apply flex flex-col gap-2 p-3 border rounded-lg;
  }
</style>
