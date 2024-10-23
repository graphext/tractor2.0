<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
    import { DatePicker } from "bits-ui";

    import { CalendarDots, CaretLeft, CaretRight } from "phosphor-svelte";
    import { fly } from "svelte/transition";

    import { type DateValue } from "@internationalized/date";

    export let selectedDate: DateValue;
    export let label = "Select a date";
</script>

<div class:disabled={$$props["disabled"]}>
    <DatePicker.Root
        disabled={$$props["disabled"]}
        bind:value={selectedDate}
        numberOfMonths={2}
        weekStartsOn={1}
        locale="en-UK"
        pagedNavigation={true}
        isDateDisabled={$$props["isDateDisabled"]}
    >
        <DatePicker.Label class="text-sm text-base-content/60"
            >{label}</DatePicker.Label
        >
        <DatePicker.Input
            class="flex tabular-nums w-full max-w-[320px] h-[40px] rounded-full select-none items-center bg-neutral px-3 py-1 text-sm"
            let:segments
        >
            {#each segments as { part, value }}
                <div class="inline-block select-none">
                    <DatePicker.Segment class="p-1" {part}>
                        {value}
                    </DatePicker.Segment>
                </div>
            {/each}
            <DatePicker.Trigger
                class="inline-flex hover:bg-base-content/10 ml-3 items-center justify-center rounded-full p-1 transition-all active:bg-dark-10"
            >
                <CalendarDots size={23} weight="duotone" />
            </DatePicker.Trigger>
        </DatePicker.Input>
        <DatePicker.Content
            transition={fly}
            transitionConfig={{ y: -10, duration: 100 }}
            sideOffset={6}
            class="z-50 rounded-box backdrop-blur-xl bg-base-200 shadow-lg shadow-base-100 p-3 flex flex-col md:flex-row mt-2"
        >
            <DatePicker.Calendar
                class="tabular-nums rounded-btn shadow-md p-3 pt-2 backdrop-blur bg-neutral"
                let:months
                let:weekdays
            >
                <DatePicker.Header class="flex items-center justify-between">
                    <DatePicker.PrevButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretLeft size={24} class="fill-primary" />
                    </DatePicker.PrevButton>
                    <DatePicker.Heading class="font-bold uppercase" />
                    <DatePicker.NextButton
                        class="inline-flex size-10 items-center justify-center rounded-9px bg-background-alt transition-all  active:scale-98"
                    >
                        <CaretRight size={24} class="fill-primary" />
                    </DatePicker.NextButton>
                </DatePicker.Header>
                <div
                    class="flex flex-col pt-4 sm:flex-row sm:space-x-4 sm:space-y-0"
                >
                    {#each months as month}
                        <DatePicker.Grid
                            class="w-full border-collapse select-none space-y-1"
                        >
                            <DatePicker.GridHead>
                                <DatePicker.GridRow
                                    class="mb-1 flex w-full justify-between text-base-content/70"
                                >
                                    {#each weekdays as day}
                                        <DatePicker.HeadCell
                                            class="w-10 rounded-md text-xs font-thin"
                                        >
                                            {day}
                                        </DatePicker.HeadCell>
                                    {/each}
                                </DatePicker.GridRow>
                            </DatePicker.GridHead>
                            <DatePicker.GridBody>
                                {#each month.weeks as weekDates}
                                    <DatePicker.GridRow class="flex w-full">
                                        {#each weekDates as date}
                                            <DatePicker.Cell
                                                {date}
                                                class="relative m-0 size-10 overflow-visible !p-0 text-center text-sm focus-within:relative focus-within:z-20 hover:bg-base-300 duration-75 transition-all"
                                            >
                                                <DatePicker.Day
                                                    {date}
                                                    month={month.value}
                                                    class="group relative
                                                inline-flex size-10 items-center
                                                justify-center overflow-visible
                                                whitespace-nowrap rounded-sm border border-transparent bg-background bg-transparent p-0 text-sm font-normal transition-all data-[disabled]:pointer-events-none data-[outside-month]:pointer-events-none data-[outside-month]:text-base-content/40 data-[highlighted]:rounded-none data-[selection-end]:text-base-content data-[selection-end]:bg-primary/10 data-[selection-end]:border-2 data-[selection-end]:border-primary data-[selection-start]:bg-primary/5 data-[selection-start]:border-2 data-[selection-start]:border-primary data-[highlighted]:bg-base-content/20 data-[selected]:bg-primary data-[today]:border-primary/30 data-[selected]:text-primary-content  data-[selection-start]:bg-foreground data-[selected]:font-bold data-[selection-end]:font-bold data-[selection-start]:font-bold data-[disabled]:text-foreground/30 data-[selected]:text-foreground data-[selection-start]:text-base-content data-[unavailable]:line-through data-[disabled]:text-base-content/20"
                                                />
                                            </DatePicker.Cell>
                                        {/each}
                                    </DatePicker.GridRow>
                                {/each}
                            </DatePicker.GridBody>
                        </DatePicker.Grid>
                    {/each}
                </div>
            </DatePicker.Calendar>
        </DatePicker.Content>
    </DatePicker.Root>
</div>

<style>
    .disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
