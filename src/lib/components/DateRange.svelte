<script lang="ts">
    import { DatePicker } from "@svelte-plugins/datepicker";
    import { format } from "date-fns";

    const today = new Date();

    const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

    const getDateFromToday = (days: Date) => {
        return Date.now() - days * MILLISECONDS_IN_DAY;
    };

    let startDate = getDateFromToday(29);
    let endDate = today;
    let dateFormat = "MMM d, yyyy";
    let isOpen = false;

    let formattedStartDate = "";

    const onClearDates = () => {
        startDate = "";
        endDate = "";
    };

    const toggleDatePicker = () => (isOpen = !isOpen);
    const formatDate = (dateString) =>
        (dateString && format(new Date(dateString), dateFormat)) || "";

    $: formattedStartDate = formatDate(startDate);
    $: formattedEndDate = formatDate(endDate);
</script>

<div class="date-filter">
    <DatePicker bind:isOpen bind:startDate bind:endDate isRange isMultipane>
        <div class="date-field" on:click={toggleDatePicker} class:open={isOpen}>
            <i class="icon-calendar" />
            <div class="date">
                {#if startDate}
                    {formattedStartDate} - {formattedEndDate}
                {:else}
                    Pick a date
                {/if}
            </div>
            {#if startDate}
                <span on:click={onClearDates}>
                    <i class="os-icon-x" />
                </span>
            {/if}
        </div>
    </DatePicker>
</div>
