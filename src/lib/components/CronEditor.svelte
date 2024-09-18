<script lang="ts">
    import { composeCronExpression, identifyCronExpression } from "$lib/utils";
    import { Select, type Selected } from "bits-ui";
    import ClockClockwise from "phosphor-svelte/lib/ClockClockwise";
    import { fly, slide } from "svelte/transition";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { createFunctionString, scheduleTask } from "$lib/apifyEndpoints";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";

    export let queries: string;
    export let queriesSpreadOverTime: string;
    export let numTweets: number;
    export let scheduleNumTweets: number = 100;

    let options = [
        { label: "minutes", value: "minute" },
        { label: "hours", value: "hour" },
        { label: "days", value: "day" },
        { label: "months", value: "month" },
        { label: "years", value: "year" },
    ];

    let selectedInterval: Selected<string> = options[2];
    let intervalNumber: number = 2;

    let withinTimeParameter: string = `within_time:${intervalNumber}d`;
    $: switch (selectedInterval.value) {
        case "minute":
            withinTimeParameter = `within_time:${intervalNumber}m`;
            break;

        case "hour":
            withinTimeParameter = `within_time:${intervalNumber}h`;
            break;

        case "days":
            withinTimeParameter = `within_time:${intervalNumber}d`;
            break;

        case "month":
            withinTimeParameter = `within_time:${intervalNumber * 30}d`;
            break;

        case "year":
            withinTimeParameter = `within_time:${intervalNumber * 365}d`;
            break;
    }

    let hour = new Date().getHours();
    let minute = new Date().getMinutes();

    $: time = { hour: hour, minute: minute };

    let cronExpression: string = composeCronExpression(
        intervalNumber,
        selectedInterval.value,
        time,
    );

    $: cronExpressionScope = identifyCronExpression(
        cronExpression,
        intervalNumber,
    );
    $: console.log(cronExpressionScope);

    $: console.log(cronExpression);

    let loading: boolean = false,
        error;
    let description: string | undefined;
    let schedule: Object | undefined;
    let datasetId: string;

    $: prompt = `${queries}

${cronExpression}
`;

    async function generateDescription() {
        error = "";

        try {
            const res = await fetch("/api/descriptions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`,
                );
            }

            return res.text();
        } catch (err) {
            console.error("Error:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
        }
    }

    async function handleSchedule() {
        console.log("scheduling task...");
        try {
            loading = true;

            const queryListWithinTime = queries
                .split("\n")
                .filter((q) => q.trim() !== "")
                .map((t) => {
                    t.trim();
                    t += ` ${withinTimeParameter}`;
                    return t;
                });

            const queriesSpreadOverTimeArray = queriesSpreadOverTime
                .split("\n")
                .filter((q) => q.trim() !== "")
                .map((t) => t.trim());

            const nQueries = queries.split("\n").length;
            const maxTweetsPerQuery = Math.ceil(scheduleNumTweets / nQueries);

            const scheduledTaskInput = {
                customMapFunction: createFunctionString(),
                maxItems: scheduleNumTweets,
                maxTweetsPerQuery: maxTweetsPerQuery,
                includeSearchTerms: false,
                onlyImage: false,
                onlyQuote: false,
                onlyTwitterBlue: false,
                onlyVerifiedUsers: false,
                onlyVideo: false,
                sort: "Latest",
                searchTerms: queryListWithinTime,
            };

            const historicDataInput = {
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
                searchTerms: queriesSpreadOverTimeArray,
            };

            description = await generateDescription();

            if (description) {
                toast.success(description);
            }
            const { scheduleData, datasetId: newDatasetId } =
                await scheduleTask({
                    scheduledTaskInput: scheduledTaskInput,
                    historicDataInput: historicDataInput,
                    cronExpression: cronExpression,
                    description: description,
                });

            schedule = scheduleData.data;

            datasetId = newDatasetId;

            loading = false;
        } catch (e) {
            console.error("Error setting up schedule", e);
            throw e;
        }
    }
</script>

<div class="mt-5 flex justify-end">
    {#if !schedule && !loading}
        <div class="flex gap-3 items-center self-end">
            <ClockClockwise weight="duotone" size={24} />
            <p class="text-base-content/60">Schedule task every</p>
            <input
                type="number"
                min="1"
                max="59"
                on:keyup={(v) => {
                    cronExpression = composeCronExpression(
                        v.target.value,
                        selectedInterval.value,
                        time,
                    );
                }}
                on:change={(v) => {
                    cronExpression = composeCronExpression(
                        v.target.value,
                        selectedInterval.value,
                        time,
                    );
                }}
                bind:value={intervalNumber}
                class="input input-sm rounded-full w-[45px] text-center bg-neutral"
            />
            <Select.Root
                onOpenChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value,
                        time,
                    );
                }}
                onSelectedChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value,
                        time,
                    );
                }}
                bind:selected={selectedInterval}
                items={options}
            >
                <div class="flex flex-col">
                    <Select.Trigger
                        aria-label="Select an interval"
                        class="w-[100px] flex items-center pl-3 pr-2 py-[3px] rounded-full bg-neutral"
                    >
                        <Select.Value placeholder="Select an interval" />
                    </Select.Trigger>

                    <Select.Content
                        class="w-full backdrop-blur bg-base-200 rounded-xl shadow-md shadow-base-100 px-1 py-1"
                        transition={fly}
                        transitionConfig={{ duration: 100, y: 20 }}
                        sameWidth
                        sideOffset={8}
                    >
                        {#each options as option}
                            <Select.Item
                                class="flex justify-between h-7 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[disabled]:text-base-content/50"
                                value={option.value}
                                label={intervalNumber == 1
                                    ? option.label.slice(0, -1)
                                    : option.label}
                            ></Select.Item>
                        {/each}
                    </Select.Content>
                </div>
            </Select.Root>

            <p class="text-base-content/60">at</p>

            {#if selectedInterval.value == "day" || selectedInterval.value == "month" || selectedInterval.value == "year"}
                <div
                    transition:slide={{
                        axis: "x",
                        duration: 100,
                        easing: cubicInOut,
                    }}
                    class="flex gap-1 items-center"
                >
                    <input
                        type="number"
                        min="0"
                        max="24"
                        bind:value={hour}
                        on:keyup={() => {
                            if (hour >= 23) {
                                hour = 23;
                            } else if (hour <= 0) {
                                hour = 0;
                            }

                            cronExpression = composeCronExpression(
                                intervalNumber,
                                selectedInterval.value,
                                time,
                            );
                        }}
                        class="input input-sm rounded-full w-[50px] text-center bg-neutral"
                    />
                    :
                    <input
                        type="number"
                        bind:value={minute}
                        on:keyup={() => {
                            if (minute >= 59) {
                                minute = 59;
                            } else if (minute <= 0) {
                                minute = 0;
                            }

                            cronExpression = composeCronExpression(
                                intervalNumber,
                                selectedInterval.value,
                                time,
                            );
                        }}
                        min="0"
                        max="59"
                        class="input input-sm rounded-full w-[50px] text-center bg-neutral"
                    />
                </div>
            {/if}

            <p class="text-base-content/60">and bring</p>

            <input
                type="number"
                bind:value={scheduleNumTweets}
                min="1"
                max="10000"
                class="input input-sm rounded-full w-[90px] text-center bg-neutral"
                placeholder="# tweets"
            />

            <p class="text-base-content/60">tweets per schedule</p>

            <button
                disabled={!$apifyKey || !queries}
                on:click={handleSchedule}
                class="btn btn-primary btn-sm rounded-full btn-outline"
                >Schedule</button
            >
        </div>
    {:else if schedule}
        <div class="flex w-full gap-3">
            <a
                class="btn btn-success grow text-sm"
                target="_blank"
                href="https://console.apify.com/organization/{schedule.userId}/storage/datasets/{datasetId}"
                >{schedule.name} • {description}</a
            >
            <button
                class="btn btn-warning grow"
                on:click={() => {
                    navigator.clipboard.writeText(
                        `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`,
                    );
                    toast.info(
                        "Copied link to dataset to the clipboard. Head to Graphext and create a new project using this link as source",
                    );
                }}>Copy dataset link (to use in Graphext)</button
            >
        </div>
    {:else}
        <div
            class="select-none btn btn-disabled btn-primary btn-outline w-full"
        >
            loading...
        </div>
    {/if}
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
