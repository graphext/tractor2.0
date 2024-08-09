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

    let hour = new Date().getHours()
    let minute = new Date().getMinutes()

    let selectedInterval: Selected<string> = options[2]
    let intervalNumber: number = 2

    $: time = { hour: hour, minute: minute }

    export let cronExpression: string = composeCronExpression(
        intervalNumber,
        selectedInterval.value,
        time
    )

    let loading: boolean = false,
        error
    let description: string | undefined
    let datasetName: string | undefined
    let schedule: Object | undefined
    let datasetId: string

    $: prompt = `${queries}

${cronExpression}
`

    async function generateScheduleKeyWord() {
        try {
            const res = await fetch('/api/schedulekw', {
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
            const keyword = await generateScheduleKeyWord()

            datasetId = datasetData.data.id
            console.log(datasetName, datasetId)

            const taskData = await createTask(ACT_ID, input)
            const taskId = taskData.data.id

            description = await generateDescription()
            console.log(description)

            if (description) {
                toast.success(description)
            }
            const { scheduleData, webhookData } = await scheduleTask({
                taskId: taskId,
                scheduleKW: keyword ? keyword : '',
                datasetId: datasetId,
                cronExpression: cronExpression,
                description: description
            })

            schedule = scheduleData.data

            loading = false
        } catch (e) {
            console.error('Error setting up schedule', e)
            throw e
        }
    }
</script>

<div class="mt-5 flex justify-end">
    {#if !schedule && !loading}
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
                        time
                    )
                }}
                bind:value={intervalNumber}
                class="input input-sm input-primary tabular-nums w-[45px] text-center"
            />
            <Select.Root
                onOpenChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value,
                        time
                    )
                }}
                onSelectedChange={(e) => {
                    cronExpression = composeCronExpression(
                        intervalNumber,
                        selectedInterval.value,
                        time
                    )
                }}
                bind:selected={selectedInterval}
                items={options}
            >
                <div class="flex flex-col">
                    <Select.Trigger
                        aria-label="Select a theme"
                        class="w-[100px] flex items-center pl-3 pr-2 py-[3px] border-primary border rounded-btn"
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

            at

            <div class="flex gap-1 items-center">
                <input
                    type="number"
                    min="0"
                    max="24"
                    bind:value={hour}
                    on:keyup={() => {
                        if (hour >= 23) {
                            hour = 23
                        } else if (hour <= 0) {
                            hour = 0
                        }

                        cronExpression = composeCronExpression(
                            intervalNumber,
                            selectedInterval.value,
                            time
                        )
                    }}
                    class="input input-sm input-bordered w-[43px] text-center tabular-nums"
                />
                :
                <input
                    type="number"
                    bind:value={minute}
                    on:keyup={() => {
                        if (minute >= 59) {
                            minute = 59
                        } else if (minute <= 0) {
                            minute = 0
                        }

                        cronExpression = composeCronExpression(
                            intervalNumber,
                            selectedInterval.value,
                            time
                        )
                    }}
                    min="0"
                    max="59"
                    class="input input-sm input-bordered w-[43px] text-center tabular-nums"
                />
            </div>

            <button
                disabled={!$apifyKey || !queries}
                on:click={handleSchedule}
                class="btn btn-primary btn-sm btn-outline">Schedule</button
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
                        `https://api.apify.com/v2/datasets/${datasetId}/items?clean=true&format=json`
                    )
                    toast.info(
                        'Copied link to dataset to the clipboard. Head to Graphext and create a new project using this link as source'
                    )
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
    input[type='number'] {
        -moz-appearance: textfield;
        appearance: textfield;
    }
</style>
