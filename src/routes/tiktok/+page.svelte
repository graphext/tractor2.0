<script lang="ts">
    import Section from "$lib/components/Section.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import { Tooltip } from "bits-ui";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import { TIKTOK_ACTOR_ID } from "$lib/actors";
    import {
        type DateValue,
        today,
        getLocalTimeZone,
    } from "@internationalized/date";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import Status from "$lib/components/Status.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import { Hash, MagnifyingGlass, QuestionMark, User } from "phosphor-svelte";
    import Input from "$lib/components/Input.svelte";

    let apifyClient = new ApifyClient(TIKTOK_ACTOR_ID);
    const socialMedia = "youtube";

    let maxItems = 100;
    $: maxItemsWarning = maxItems;

    let query = "";

    $: buttonText = loading ? `Loading Tiktoks...` : `Get Tiktok data`;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let datasetLink;
    let runId: string;

    let resuming: boolean;
    let loading: boolean = false;
    let confirmChoice = false;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkTikTokStatus({ apifyClient, maxItems, runId });
        }, 500);
    }

    let status: string;
    let error: string;

    let csvBlob: Blob;
    let headers: string[], rows: Array<string[]>;
    let userId: string;
    let datasetData: any;
    let filename: string;
    let datasetSize: number;

    let selectedDate: DateValue;

    async function checkTikTokStatus({
        apifyClient,
        maxItems,
        runId,
    }: {
        apifyClient: ApifyClient;
        maxItems: number;
        runId: string;
    }) {}
    async function handleTikTokSubmit() {}
</script>

<Section>
    <form
        on:submit|preventDefault={handleTikTokSubmit}
        class="flex flex-col gap-5"
    >
        <div>
            <div class="flex items-center mb-2 gap-1">
                <label for="keywords" class="text-sm text-base-content/60"
                    >Search Tiktok:</label
                >
                <Tooltip.Root openDelay={0}>
                    <Tooltip.Trigger class="w-fit">
                        <QuestionMark
                            size={20}
                            weight="bold"
                            class="rounded-full bg-neutral border-2 border-base-300"
                        />
                    </Tooltip.Trigger>
                    <TooltipContent
                        side="right"
                        sideOffset={30}
                        transitionConfig={{ duration: 100, x: -5 }}
                    >
                        <ul class="list-disc list-inside flex flex-col gap-2">
                            <li>
                                Use <span class="text-primary font-bold">@</span
                                ><span class="opacity-70">username</span> to search
                                posts from a profile
                            </li>

                            <li>
                                You can include a link to a profile: <span
                                    class="font-bold"
                                    >https://instagram.com</span
                                ><span class="opacity-70">/username</span>
                            </li>

                            <li>
                                You can also include a link to a specific post: <span
                                    class="font-bold"
                                    >https://instagram.com</span
                                ><span class="opacity-70">/p/postID</span>, to
                                search for comments, for example.
                            </li>
                        </ul>
                    </TooltipContent>
                </Tooltip.Root>
            </div>

            <div class="join w-full">
                <label
                    class="input input-sm bg-neutral input-bordered flex w-full join-item items-center gap-2"
                >
                    <Hash weight="bold" class="opacity-70" />
                    <input
                        type="text"
                        class="grow"
                        placeholder="Search Hashtags"
                    />
                </label>

                <label
                    class="input input-sm bg-neutral input-bordered flex
                    join-item w-full items-center gap-2"
                >
                    <User weight="bold" class="opacity-70" />
                    <input
                        type="text"
                        class="grow"
                        placeholder="Search Profiles"
                    />
                </label>

                <label
                    class="input input-sm bg-neutral w-full input-bordered flex join-item items-center gap-2"
                >
                    <MagnifyingGlass weight="bold" class="opacity-70" />
                    <input
                        type="text"
                        class="grow"
                        placeholder="Search Keywords"
                    />
                </label>
            </div>
        </div>

        <div class="flex gap-5 items-center">
            <div class="w-fit">
                <DatePicker
                    disabled={loading}
                    label={"Search videos newer than"}
                    isDateDisabled={(d) => {
                        return d > today(getLocalTimeZone());
                    }}
                    bind:selectedDate
                />
            </div>
            <div class="flex flex-col gap-1">
                <label for="maxItems" class="text-sm text-base-content/60"
                    >Videos to search for:</label
                >
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral
                w-40 self-end"
                    inputmode="numeric"
                    type="number"
                    id="maxItems"
                    disabled={loading}
                    bind:value={maxItems}
                    placeholder="Enter maximum number of items"
                />
            </div>
        </div>

        <div class="w-full relative">
            {#if loading}
                <progress
                    class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            {#if !confirmChoice}
                <button
                    on:click={() => (confirmChoice = true)}
                    class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                    disabled={!$apifyKey || !query}
                    class:disabled={!$apifyKey || !query}
                >
                    {#if loading}
                        <span class="loading loading-ring"></span>
                    {/if}
                    {buttonText}
                </button>
            {:else}
                <WarningCost unitPrice={5 / 1000} maxItems={maxItemsWarning} />
                <button
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !query}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>

    <DownloadButton
        {csvBlob}
        {filename}
        {datasetSize}
        {loading}
        {socialMedia}
    />

    {#if error || status}
        <div>
            <div class="divider mt-3 mb-3" />

            <div class="flex flex-col gap-5">
                <div class="flex justify-between items-baseline">
                    {#if status == "RUNNING" || status == "ABORTING"}
                        <StopButton {apifyClient} {runId} />
                    {/if}

                    {#if status == "ABORTED" || status == "READY"}
                        <ResumeButton
                            {status}
                            bind:resuming
                            {apifyClient}
                            {runId}
                        />
                    {/if}

                    {#if error}
                        <Error {error} {userId} {runId} />
                    {:else}
                        <p class="opacity-0">error</p>
                    {/if}

                    {#if status}
                        <Status {status} {outputProgress} />
                    {/if}
                </div>

                <LiveTable {headers} {rows} />
            </div>
        </div>
    {/if}
</Section>
