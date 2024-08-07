<script lang="ts">
    import { composeCronExpression } from "$lib/utils";
    import { Select, type Selected } from "bits-ui";
    import ClockClockwise from "phosphor-svelte/lib/ClockClockwise";
    import { fly } from "svelte/transition";
    import { apifyKey } from "$lib/stores/apifyStore";
    import {
        ACT_ID,
        createFunctionString,
        createTask,
        scheduleTask,
    } from "$lib/apifyEndpoints";

    export let queriesSpreadOverTime: string;
    export let numTweets: number;

    let options = [
        { label: "minutes", value: "minute" },
        { label: "hours", value: "hour" },
        { label: "days", value: "day" },
        { label: "months", value: "month" },
        { label: "years", value: "year" },
    ];

    let selectedInterval: Selected<string> = options[2];
    let intervalNumber: number = 1;

    export let cronExpression: string = composeCronExpression(
        intervalNumber,
        selectedInterval.value,
    );

    async function handleSchedule() {
        console.log("scheduling task...");
        try {
            const queryList = queriesSpreadOverTime
                .split("\n")
                .filter((q) => q.trim() !== "");
            const nQueries = queriesSpreadOverTime.split("\n").length;
            const maxTweetsPerQuery = Math.ceil(numTweets / nQueries);

            const input = {
                customMapFunction: createFunctionString(),
                maxItems: numTweets,
                maxTweetsPerQuery: maxTweetsPerQuery,
                includeSearchTerms: false,
                onlyImage: false,
                onlyQuote: false,
                onlyTwitterBlue: false,
                onlyVerifiedUsers: false,
                onlyVideo: false,
                sort: "Latest",
                searchTerms: queryList,
            };

            const taskData = await createTask(ACT_ID, input);
            const taskId = taskData.data.id;
            console.log(taskId);

            const data = scheduleTask({
                taskId: taskId,
                queries: queryList,
                cronExpression: cronExpression,
                numTweets: numTweets,
                maxTweetsPerQuery: maxTweetsPerQuery,
            });
        } catch (e) {
            console.error("Error setting up schedule", e);
            throw e;
        }
    }
</script>

<div class="flex gap-3 items-center self-end">
    <ClockClockwise weight="duotone" size={24} />
    Schedule task every
    <input
        type="number"
        min="1"
        max="59"
        on:change={(v) => {
            cronExpression = composeCronExpression(
                v.target.value,
                selectedInterval.value,
            );
        }}
        bind:value={intervalNumber}
        class="input input-sm input-primary tabular-nums text-right w-[80px]"
    />
    <Select.Root
        onOpenChange={(e) => {
            cronExpression = composeCronExpression(
                intervalNumber,
                selectedInterval.value,
            );
        }}
        onSelectedChange={(e) => {
            cronExpression = composeCronExpression(
                intervalNumber,
                selectedInterval.value,
            );
        }}
        bind:selected={selectedInterval}
        items={options}
    >
        <div class="flex flex-col">
            <Select.Trigger
                aria-label="Select a theme"
                class="w-[100px] flex items-center pl-3 pr-2 py-1 h-min border-primary border rounded-btn"
            >
                <Select.Value placeholder="Select an interval" />
            </Select.Trigger>

            <Select.Content
                class="w-full backdrop-blur bg-base-100/80 rounded-xl border border-primary shadow-md shadow-base-300 px-1 py-1"
                transition={fly}
                transitionConfig={{ duration: 100, y: 20 }}
                sameWidth
                sideOffset={8}
            >
                {#each options as option}
                    <Select.Item
                        class="flex justify-between h-10 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-primary data-[highlighted]:text-secondary-content data-[highlighted]:font-bold data-[disabled]:text-base-content/50"
                        value={option.value}
                        label={intervalNumber == 1
                            ? option.label.slice(0, -1)
                            : option.label}
                    ></Select.Item>
                {/each}
            </Select.Content>
        </div>
    </Select.Root>

    <button
        disabled={!$apifyKey || !queriesSpreadOverTime}
        on:click={handleSchedule}
        class="btn btn-primary btn-sm btn-outline">Schedule</button
    >
</div>

<style>
    /* Chrome, Safari, Edge, Opera */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type="number"] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
