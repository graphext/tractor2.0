<script lang="ts">
    import { run } from 'svelte/legacy';

    import { composeCronExpression, identifyCronExpression } from "$lib/utils";
    import { Select, type Selected } from "bits-ui";
    import ClockClockwise from "phosphor-svelte/lib/ClockClockwise";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { toast } from "svelte-sonner";
    import { ApifyClient, ApifyScheduler } from "$lib/apifyEndpoints";
    import { createFunctionString } from "$lib/postprocess";
    import { userQuery } from "$lib/stores/userQueryStore";
    import {
        frequencyStore,
        selectedDateRange,
        selectedLists,
    } from "$lib/stores/store";


    interface Props {
        queries: string;
        queriesSpreadOverTime: string;
        numTweets: number;
        scheduleNumTweets?: number;
        actorId: string;
    }

    let {
        queries,
        queriesSpreadOverTime,
        numTweets,
        scheduleNumTweets = $bindable(100),
        actorId
    }: Props = $props();

    let options = [
        { label: "minutes", value: "minute" },
        { label: "hours", value: "hour" },
        { label: "days", value: "day" },
        { label: "months", value: "month" },
        { label: "years", value: "year" },
    ];

    let selectedInterval: Selected<string> = $state(options[2]);
    let intervalNumber: number = $state(1);

    let withinTimeParameter: string = $state(`within_time:${intervalNumber}d`);
    run(() => {
        switch (selectedInterval.value) {
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
    });

    let hour = new Date().getHours();
    let minute = new Date().getMinutes();

    let time = $derived({ hour: hour, minute: minute });

    let cronExpression: string = $state(composeCronExpression(
        intervalNumber,
        selectedInterval.value,
        time,
    ));

    let loading: boolean = $state(false),
        error;
    let description: string | undefined = $state();
    let schedule: Object | undefined = $state();
    let datasetId: string = $state();

    const apifyClient = new ApifyClient(actorId); // Twitter Actor ID
    const apifyScheduler = new ApifyScheduler(apifyClient);

    let prompt = $derived(`${queries}
${cronExpression}`);

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
        console.log("scheduling task");
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

            if (window.dataLayer) {
                const sendEvent = {
                    event: "tractor-schedule",
                    tr_social_media: "twitter",
                    tr_gpt_query: $userQuery,
                    tr_queries_schedule: queryListWithinTime,
                    tr_queries_historic: queriesSpreadOverTimeArray,
                    tr_schedule_frequency_number: intervalNumber,
                    tr_schedule_frequency: selectedInterval.value,
                    tr_num_items: numTweets,
                    tr_num_items_per_schedule: scheduleNumTweets,
                    tr_lists: $selectedLists,
                    tr_frequency_historic_data: $frequencyStore,
                    tr_cron_expression_schedule: cronExpression,
                    tr_date_range_start_historic_data:
                        $selectedDateRange!.start?.toString(),
                    tr_date_range_end_historic_data:
                        $selectedDateRange!.end?.toString(),
                };

                console.log(sendEvent);
                window.dataLayer.push(sendEvent);
            }

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
                await apifyScheduler.scheduleTask({
                    scheduledTaskInput: scheduledTaskInput,
                    historicDataInput: historicDataInput,
                    cronExpression: cronExpression,
                    description: description,
                    fields: ["url<gx:url>"],
                });

            schedule = scheduleData.data;

            datasetId = newDatasetId;
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            console.error(err);
        } finally {
            loading = false;
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
                onkeyup={(v) => {
                    cronExpression = composeCronExpression(
                        v.target.value,
                        selectedInterval.value,
                        time,
                    );
                }}
                onchange={(v) => {
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
                preventScroll={false}
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
                </div>
                <Select.Content
                    class="w-full backdrop-blur bg-base-200 rounded-xl shadow-md shadow-base-100 px-1 py-1 outline-none"
                >
                    {#each options as option}
                        <Select.Item
                            class="flex justify-between h-7 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[disabled]:text-base-content/50"
                            value={option.value}
                        >
                            {option.label}
                        </Select.Item>
                    {/each}
                </Select.Content>
            </Select.Root>

            <p class="text-base-content/60">and bring</p>

            <input
                type="number"
                bind:value={scheduleNumTweets}
                min="1"
                max="10000"
                class="input input-sm rounded-full w-[90px] text-center bg-neutral"
                placeholder="# tweets"
            />
            <p class="text-base-content/60">items per schedule</p>
            <button
                disabled={!$apifyKey || !queries}
                onclick={handleSchedule}
                class="btn btn-primary btn-sm rounded-full btn-outline"
                >Schedule</button
            >
        </div>
    {:else if schedule}
        <div class="flex w-full gap-3">
            <a
                class="btn btn-success grow text-sm rounded-full"
                target="_blank"
                href="https://console.apify.com/organization/{schedule.userId}/storage/datasets/{datasetId}"
                >{schedule.name} • {description}</a
            >
            <button
                class="btn btn-warning grow rounded-full"
                onclick={() => {
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
            class="select-none btn btn-disabled btn-primary btn-outline w-full rounded-full"
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
