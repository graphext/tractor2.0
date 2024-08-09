<script lang="ts">
    import { composeCronExpression } from '$lib/utils'
    import { Select, type Selected } from 'bits-ui'
    import ClockClockwise from 'phosphor-svelte/lib/ClockClockwise'
    import { fly } from 'svelte/transition'
    import { apifyKey } from '$lib/stores/apifyStore'
    import {
        ACT_ID,
        createDataset,
        createFunctionString,
        createTask,
        scheduleTask
    } from '$lib/apifyEndpoints'
    import { toast } from 'svelte-sonner'

    export let queries: string
    export let numTweets: number

    let options = [
        { label: 'minutes', value: 'minute' },
        { label: 'hours', value: 'hour' },
        { label: 'days', value: 'day' },
        { label: 'months', value: 'month' },
        { label: 'years', value: 'year' }
    ]

    let selectedInterval: Selected<string> = options[2]
    let intervalNumber: number = 2

    export let cronExpression: string = composeCronExpression(
        intervalNumber,
        selectedInterval.value
    )

    let loading: boolean = false,
        error
    let description: string | undefined
    let datasetName: string | undefined
    let scheduleData: Object | undefined

    const prompt = `${queries}

${cronExpression}
`

    async function generateDatasetName() {
        try {
            const res = await fetch('/api/ids', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`
                )
            }

            return res.text()
        } catch (err) {
            console.error('Error:', err)
            error =
                err instanceof Error ? err.message : 'An unknown error occurred'
        }
    }

    async function generateDescription() {
        error = ''

        try {
            const res = await fetch('/api/descriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`
                )
            }

            return res.text()
        } catch (err) {
            console.error('Error:', err)
            error =
                err instanceof Error ? err.message : 'An unknown error occurred'
        }
    }

    async function handleSchedule() {
        console.log('scheduling task...')
        try {
            loading = true
            const queryList = queries
                .split('\n')
                .filter((q) => q.trim() !== '')
                .map((t) => t.trim())
            const nQueries = queries.split('\n').length
            const maxTweetsPerQuery = Math.ceil(numTweets / nQueries)

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
                sort: 'Latest',
                searchTerms: queryList
            }

            const datasetName = await generateDatasetName()
            const datasetData = await createDataset(
                datasetName ? datasetName : 'dataset-test'
            )

            const datasetId = datasetData.data.id
            console.log(datasetName, datasetId)

            const taskData = await createTask(ACT_ID, input)
            const taskId = taskData.data.id

            description = await generateDescription()
            console.log(description)

            if (description) {
                toast.success(description)
            }
            scheduleData = await scheduleTask({
                taskId: taskId,
                datasetId: datasetId,
                cronExpression: cronExpression,
                description: description
            })

            loading = false
        } catch (e) {
            console.error('Error setting up schedule', e)
            throw e
        }
    }
</script>

<div class="mt-5 flex justify-end">
    {#if !scheduleData && !loading}
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
                        selectedInterval.value
                    )
                }}
                bind:value={intervalNumber}
                class="input h-[34px] input-primary tabular-nums text-right w-[80px]"
            />
            <Select.Root
                onOpenChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value
                    )
                }}
                onSelectedChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value
                    )
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
                disabled={!$apifyKey || !queries}
                on:click={handleSchedule}
                class="btn btn-primary btn-sm btn-outline">Schedule</button
            >
        </div>
    {:else if scheduleData}
        <a
            class="btn btn-primary btn-outline w-full"
            target="_blank"
            href="https://console.apify.com/organization/{scheduleData.data
                .userId}/schedules/{scheduleData.data.id}"
            >{scheduleData.data.name} • {description}</a
        >
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
    input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
