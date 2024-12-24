<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
    import type { DateRange } from "bits-ui";
    import {
        today,
        getLocalTimeZone,
        CalendarDate,
        type DateValue,
    } from "@internationalized/date";
    import { DateRangePicker } from "bits-ui";
    import { fly } from "svelte/transition";
    import {
        utcDay,
        utcMonth,
        utcMonday,
        utcYear,
        type CountableTimeInterval,
    } from "d3-time";
    import { frequencyStore, selectedDateRange } from "$lib/stores/store";
    import { onMount } from "svelte";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";
    import CalendarDots from "phosphor-svelte/lib/CalendarDots";

    export let selectedRange: DateRange = {
        start: today(getLocalTimeZone()).subtract({ months: 1, days: 1 }),
        end: today(getLocalTimeZone()),
    };

    export let timeSteps: Date[];

    const presets = [
        {
            label: "Yesterday",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        days: 1,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },
        {
            label: "Last 3 days",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        days: 3,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },

        {
            label: "Last Week",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        weeks: 1,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },

        {
            label: "Last Month",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        months: 1,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },

        {
            label: "Last Year",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        years: 1,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },

        {
            label: "Last 3 Years",
            func: () => {
                selectedRange = {
                    start: today(getLocalTimeZone()).subtract({
                        years: 3,
                    }),
                    end: today(getLocalTimeZone()),
                };
            },
        },
    ];

    const functionMap: Record<string, CountableTimeInterval> = {
        Daily: utcDay,
        Weekly: utcMonday,
        Monthly: utcMonth,
        Anually: utcYear,
    };

    function debounce(func: Function, delay: number) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    }

    function recalculateDateRange(
        selectedRange: DateRange,
        frequencyStore: string,
    ) {
        if (selectedRange && selectedRange.start && selectedRange.end) {
            timeSteps = functionMap[frequencyStore].range(
                new Date(
                    selectedRange.start.year,
                    selectedRange.start.month - 1,
                    selectedRange.start.day,
                ),
                new Date(
                    selectedRange.end.year,
                    selectedRange.end.month - 1,
                    selectedRange.end.day,
                ),
                1,
            );
        }
    }

    const debouncedDateRange = debounce(recalculateDateRange, 600);

    $: {
        debouncedDateRange(selectedRange, $frequencyStore);
    }

    onMount(() => {
        if ($frequencyStore == "Anually") {
            $frequencyStore = "Daily";
        }

        $selectedDateRange = selectedRange;
    });

    const minValue: DateValue = new CalendarDate(2006, 3, 21);
</script>

<div class="flex flex-col gap-1" class:disabled={$$props["disabled"]}>
    <DateRangePicker.Root
        {...$$props}
        bind:value={selectedRange}
        weekdayFormat="short"
        pagedNavigation={true}
        weekStartsOn={1}
        onValueChange={() => {
            $selectedDateRange = selectedRange;
        }}
        locale="en-UK"
        {minValue}
        numberOfMonths={2}
    >
        <DateRangePicker.Label class="text-sm text-base-content/60"
            >Date Interval to search in</DateRangePicker.Label
        >
        <DateRangePicker.Input
            let:segments
            class="flex tabular-nums w-full max-w-[320px] h-[40px] rounded-full
            select-none items-center bg-neutral pl-3 pr-1 py-1 text-sm"
        >
            {#each segments.start as { part, value }}
                <div class="inline-block select-none">
                    {#if part === "literal"}
                        <DateRangePicker.Segment
                            type="start"
                            {part}
                            class="p-1"
                        >
                            {value}
                        </DateRangePicker.Segment>
                    {:else}
                        <DateRangePicker.Segment type="start" {part} class="">
                            {value}
                        </DateRangePicker.Segment>
                    {/if}
                </div>
            {/each}
            <div aria-hidden class="px-3">—</div>
            {#each segments.end as { part, value }}
                <div class="inline-block select-none">
                    {#if part === "literal"}
                        <DateRangePicker.Segment type="end" {part} class="p-1">
                            {value}
                        </DateRangePicker.Segment>
                    {:else}
                        <DateRangePicker.Segment type="end" {part} class="">
                            {value}
                        </DateRangePicker.Segment>
                    {/if}
                </div>
            {/each}

            <DateRangePicker.Trigger
                class="inline-flex hover:bg-base-content/10 ml-3 items-center justify-center rounded-full p-1 transition-all active:bg-dark-10"
            >
                <CalendarDots size={23} weight="duotone" />
            </DateRangePicker.Trigger>
        </DateRangePicker.Input>

        <DateRangePicker.Content
            transition={fly}
            transitionConfig={{ y: -10, duration: 100 }}
            sideOffset={6}
            class="z-50 rounded-box backdrop-blur-xl bg-base-200 shadow-lg shadow-base-100 p-3 flex flex-col md:flex-row mt-2"
        >
            <DateRangePicker.Calendar
                class="tabular-nums rounded-btn shadow-md p-3 pt-2 backdrop-blur bg-neutral"
                let:months
                let:weekdays
            >
                <DateRangePicker.Header
                    class="flex items-center justify-between"
                >
                    <DateRangePicker.PrevButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretLeft size={24} class="fill-primary" />
                    </DateRangePicker.PrevButton>
                    <DateRangePicker.Heading class="font-bold uppercase" />
                    <DateRangePicker.NextButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretRight size={24} class="fill-primary" />
                    </DateRangePicker.NextButton>
                </DateRangePicker.Header>
                <div class="divider divider-base-300 my-0"></div>
                <div
                    class="flex flex-col pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                >
                    {#each months as month}
                        <DateRangePicker.Grid
                            class="w-full border-collapse select-none space-y-1"
                        >
                            <DateRangePicker.GridHead>
                                <DateRangePicker.GridRow
                                    class="mb-1 flex w-full justify-between text-base-content/70"
                                >
                                    {#each weekdays as day}
                                        <DateRangePicker.HeadCell
                                            class="w-10 rounded-md text-xs font-thin"
                                        >
                                            <div>{day.slice(0, 2)}</div>
                                        </DateRangePicker.HeadCell>
                                    {/each}
                                </DateRangePicker.GridRow>
                            </DateRangePicker.GridHead>
                            <DateRangePicker.GridBody>
                                {#each month.weeks as weekDates}
                                    <DateRangePicker.GridRow
                                        class="flex w-full"
                                    >
                                        {#each weekDates as date}
                                            <DateRangePicker.Cell
                                                {date}
                                                class="relative m-0 size-10 overflow-visible !p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-base-300 duration-75 transition-all"
                                            >
                                                <DateRangePicker.Day
                                                    {date}
                                                    month={month.value}
                                                    class="group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap rounded-9px border border-transparent bg-background bg-transparent p-0 text-sm font-normal transition-all data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[outside-month]:text-base-content/40 data-[highlighted]:rounded-none data-[selection-end]:text-base-content data-[selection-end]:bg-primary/10 data-[selection-end]:border-2 data-[selection-end]:border-primary data-[selection-start]:bg-primary/5 data-[selection-start]:border-2 data-[selection-start]:border-primary data-[highlighted]:bg-base-content/20 data-[selected]:bg-primary data-[selected]:text-primary-content  data-[selection-start]:bg-foreground data-[selected]:font-bold data-[selection-end]:font-bold data-[selection-start]:font-bold data-[disabled]:text-foreground/30 data-[selected]:text-foreground data-[selection-start]:text-base-content data-[unavailable]:line-through data-[disabled]:text-base-content/20"
                                                >
                                                    <div
                                                        class="absolute top-[5px] hidden size-1 font-semibold rounded-full bg-foreground transition-all group-data-[today]:block group-data-[selected]:bg-background"
                                                    />
                                                    {date.day}
                                                </DateRangePicker.Day>
                                            </DateRangePicker.Cell>
                                        {/each}
                                    </DateRangePicker.GridRow>
                                {/each}
                            </DateRangePicker.GridBody>
                        </DateRangePicker.Grid>
                    {/each}
                </div>
            </DateRangePicker.Calendar>

            <div id="presets" in:fly={{ x: -5 }} class="ml-3">
                <div class="mb-4">Presets</div>
                <ul class="flex flex-col gap-3">
                    {#each presets as p, i}
                        <li>
                            <button
                                style="opacity: {0.6 +
                                    (presets.length - i) /
                                        presets.length /
                                        2.0}"
                                class="btn btn-sm btn-primary font-normal w-full"
                                on:click={p.func}>{p.label}</button
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </DateRangePicker.Content>
    </DateRangePicker.Root>
</div>

<style>
    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
