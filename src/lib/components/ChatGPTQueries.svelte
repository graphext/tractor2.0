<script lang="ts">
    import { userQuery } from '$lib/stores/userQueryStore'
    import { onMount } from 'svelte'
    import { toast } from 'svelte-sonner'
    import type { DateRange } from 'bits-ui'
    import DatePicker from './DatePicker.svelte'

    export let queries = ''
    export let queriesSpreadOverTime = ''

    let userPrompt = ''
    let error = ''
    let loading = false

    let selectedRange: DateRange
    let timeSteps: Date[]

    type TwitterInterval = {
        until: string
        since: string
    }

    $: queriesSpreadOverTime = spreadQueriesOverTime(
        queries,
        timeSteps,
        selectedRange
    )

    $: console.log(queriesSpreadOverTime)

    function groupTimeRanges(timeSteps: Date[], selectedRange: DateRange) {
        if (!timeSteps || !selectedRange) return

        let output: TwitterInterval[] = []

        let i = 1
        for (i; i < timeSteps.length; i++) {
            const since = twitterDateFormat(timeSteps[i - 1])
            const until = twitterDateFormat(timeSteps[i])

            output.push({ since: since, until: until })
        }

        output.push({
            since: twitterDateFormat(timeSteps[i - 1]),
            until: twitterDateFormat(
                new Date(
                    selectedRange.end?.year,
                    selectedRange.end?.month - 1,
                    selectedRange.end?.day
                )
            )
        })

        return output
    }

    function spreadQueriesOverTime(
        queries: string,
        timeSteps: Date[],
        selectedRange: DateRange
    ) {
        if (!timeSteps || !selectedRange) return queries

        const queriesSplit = queries.split('\n')
        queriesSpreadOverTime = ''

        const intervalsGrouped = groupTimeRanges(timeSteps, selectedRange)

        for (let q of queriesSplit) {
            for (let i = 0; i < intervalsGrouped.length; i++) {
                const since = intervalsGrouped[i].since
                const until = intervalsGrouped[i].until
                q = q.trim()

                queriesSpreadOverTime += `${q} since:${since} until:${until}\n`
            }
            queriesSpreadOverTime += '\n'
        }

        return queriesSpreadOverTime
    }

    function twitterDateFormat(date: Date) {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0') //bitch
        const year = date.getFullYear()

        return `${year}-${month}-${day}`
    }

    onMount(() => {
        if ($userQuery) {
            userPrompt = $userQuery
        }
    })

    async function generateResponse() {
        $userQuery = userPrompt
        loading = true
        error = ''
        queries = ''

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: userPrompt })
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`
                )
            }

            const reader = res.body.getReader()
            const decoder = new TextDecoder()

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value)
                queries += chunk
            }
        } catch (err) {
            console.error('Error:', err)
            error =
                err instanceof Error ? err.message : 'An unknown error occurred'
            toast.error(error)
        } finally {
            loading = false
        }
    }
</script>

<div class="flex flex-col gap-3">
    <div class="w-full flex gap-3">
        {#if loading}
            <span class="loading loading-ring loading-lg text-secondary"></span>
        {/if}
        <form class="w-full">
            <div
                class="md:join w-full flex flex-col md:flex-row md:gap-0 gap-3"
            >
                <input
                    type="text"
                    class="input transition-all input-secondary text-sm w-full join-item"
                    bind:value={userPrompt}
                    placeholder="Enter your prompt here"
                />
                <button
                    on:click={generateResponse}
                    class="btn btn-secondary join-item"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate Search Terms'}
                </button>
            </div>
        </form>
    </div>
    {#if error}
        <div class="text-error">
            {error}
        </div>
    {/if}
</div>

<DatePicker bind:selectedRange bind:timeSteps />
