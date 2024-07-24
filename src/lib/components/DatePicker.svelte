<script lang="ts">
    import type { DateRange } from "bits-ui";
    import { today, getLocalTimeZone } from "@internationalized/date";
    import { DateRangePicker } from "bits-ui";
    import { fly } from "svelte/transition";
    import {
        utcDay,
        utcMonth,
        utcWeek,
        utcYear,
        type CountableTimeInterval,
    } from "d3-time";
    import { frequencyStore } from "$lib/stores/store";
    import { onMount } from "svelte";
    import CaretLeft from "phosphor-svelte/lib/CaretLeft";
    import CaretRight from "phosphor-svelte/lib/CaretRight";

    export let selectedRange: DateRange = {
        start: today(getLocalTimeZone()).subtract({ months: 1, days: 1 }),
        end: today(getLocalTimeZone()),
    };

    export let timeSteps: Date[];

    const presets = [
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
    ];

    const functionMap: Record<string, CountableTimeInterval> = {
        Daily: utcDay,
        Weekly: utcWeek,
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

    function recalculateDateRange(selectedRange: DateRange) {
        if (
            $frequencyStore &&
            selectedRange &&
            selectedRange.start &&
            selectedRange.end
        ) {
            timeSteps = functionMap[$frequencyStore].range(
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

    $: recalculateDateRange(selectedRange);

    const debouncedDateRange = debounce(recalculateDateRange, 1500);

    onMount(() => {
        if ($frequencyStore == "Anually") {
            $frequencyStore = "Daily";
        }
    });
</script>

<div class="mt-1">
    <DateRangePicker.Root
        bind:value={selectedRange}
        fixedWeeks={true}
        weekdayFormat="short"
        pagedNavigation={true}
        locale="en-UK"
        numberOfMonths={2}
    >
        <DateRangePicker.Label class="text-sm text-base-content/60"
            >Date Interval to search in</DateRangePicker.Label
        >
        <DateRangePicker.Input
            let:segments
            on:change={() => {
                debouncedDateRange(selectedRange);
            }}
            class="flex tabular-nums w-full max-w-[320px] rounded-btn select-none items-center rounded-input border border-secondary pl-3 pr-1 py-1 text-sm"
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
                class="inline-flex hover:bg-base-content/10 p-1 ml-3 items-center justify-center rounded-[5px] text-foreground/60 transition-all active:bg-dark-10"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 256 256"
                    ><path
                        d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-68-76a12,12,0,1,1-12-12A12,12,0,0,1,140,132Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,132ZM96,172a12,12,0,1,1-12-12A12,12,0,0,1,96,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,140,172Zm44,0a12,12,0,1,1-12-12A12,12,0,0,1,184,172Z"
                    ></path></svg
                >
            </DateRangePicker.Trigger>
        </DateRangePicker.Input>

        <DateRangePicker.Content
            transition={fly}
            transitionConfig={{ y: -10, duration: 100 }}
            sideOffset={6}
            class="z-50 rounded-box backdrop-blur bg-base-100/20 flex flex-col md:flex-row"
        >
            <DateRangePicker.Calendar
                class="mt-6 tabular-nums border rounded-btn shadow-md shadow-base-content/10 border-secondary p-3 pt-2 backdrop-blur bg-base-100/40"
                let:months
                let:weekdays
            >
                <DateRangePicker.Header
                    class="flex items-center justify-between"
                >
                    <DateRangePicker.PrevButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretLeft size={24} />
                    </DateRangePicker.PrevButton>
                    <DateRangePicker.Heading class="font-bold uppercase" />
                    <DateRangePicker.NextButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretRight size={24} />
                    </DateRangePicker.NextButton>
                </DateRangePicker.Header>
                <div class="divider divider-secondary my-0"></div>
                <div
                    class="flex flex-col pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                >
                    {#each months as month}
                        <DateRangePicker.Grid
                            class="w-full border-collapse select-none space-y-1"
                        >
                            <DateRangePicker.GridHead>
                                <DateRangePicker.GridRow
                                    class="mb-1 flex w-full justify-between text-base-content/50"
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
                                                    class="group relative inline-flex size-10 items-center justify-center overflow-visible whitespace-nowrap rounded-9px border border-transparent bg-background bg-transparent p-0 text-sm font-normal text-foreground transition-all hover:border-foreground focus-visible:!ring-foreground data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[outside-month]:text-base-content/40 data-[highlighted]:rounded-none data-[selection-end]:bg-secondary/5 data-[selection-end]:border-2 data-[selection-end]:border-secondary data-[selection-end]:text-secondary data-[selection-start]:bg-secondary/5 data-[selection-start]:border-2 data-[selection-start]:border-secondary data-[selection-start]:text-secondary data-[highlighted]:bg-base-content/20 data-[selected]:bg-secondary data-[selected]:text-primary-content data-[selection-end]:bg-foreground data-[selection-start]:bg-foreground data-[selected]:font-bold data-[selection-end]:font-bold data-[selection-start]:font-bold data-[disabled]:text-foreground/30 data-[selected]:text-foreground data-[selection-end]:text-background data-[selection-start]:text-background data-[unavailable]:line-through"
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

            <div id="presets" in:fly={{ x: -5 }} class="mt-10 mx-10">
                <div class="font-bold mb-4">Presets</div>
                <ul class="flex flex-col gap-3">
                    {#each presets as p}
                        <li>
                            <button
                                class="btn btn-sm btn-outline btn-secondary"
                                on:click={p.func}>{p.label}</button
                            >
                        </li>
                    {/each}
                </ul>
            </div>
        </DateRangePicker.Content>
    </DateRangePicker.Root>
</div>
