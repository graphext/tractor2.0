<script lang="ts">
    import { run, preventDefault } from 'svelte/legacy';

    import { YOUTUBE_ACTOR_ID } from "$lib/actors";
    import { ApifyClient, getPrivateUserData } from "$lib/apifyEndpoints";
    import Section from "$lib/components/Section.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { Tooltip } from "bits-ui";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    import {
        type DateValue,
        today,
        getLocalTimeZone,
    } from "@internationalized/date";
    import {
        checkTaskStatus,
        createFileName,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { toast } from "svelte-sonner";
    import Error from "$lib/components/Error.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import { QuestionMark } from "phosphor-svelte";
    import LiveInfo from "$lib/components/LiveInfo.svelte";

    let apifyClient = new ApifyClient(YOUTUBE_ACTOR_ID, "Youtube Scraper");
    const socialMedia = "youtube";

    let query: string = $state();
    let selectedDate: DateValue = $state();

    let maxItems = $state(100);




    let loading: boolean = $state(false);

    let confirmChoice = $state(false);

    let outputProgress: number = $state(0);
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let resuming: boolean = $state();

    let status: string = $state();
    let error: string = $state();

    let datasetLink;
    let runId: string = $state();
    let csvBlob: Blob = $state();
    let headers: string[] = $state(), rows: Array<string[]> = $state();
    let userId: string = $state();
    let datasetData: any;
    let filename: string = $state();
    let datasetSize: number = $state();

    function processInputData(query: string, searchMode: string) {
        if (!query) return;

        let output: object;
        if (searchMode == "search") {
            output = {
                downloadSubtitles: true,
                hasCC: false,
                hasLocation: false,
                hasSubtitles: false,
                is360: false,
                is3D: false,
                is4K: false,
                isBought: false,
                isHD: false,
                isHDR: false,
                isLive: false,
                isVR180: false,
                maxResultStreams: 0,
                maxResults: maxItems,
                maxResultsShorts: 0,
                saveSubsToKVS: false,
                searchKeywords: query,
            };
        } else {
            const startUrls = query
                .split(",")
                .map((a) => a.trim())
                .map((url) => {
                    return {
                        url: url,
                        method: "GET",
                    };
                });

            output = {
                downloadSubtitles: true,
                hasCC: false,
                hasLocation: false,
                hasSubtitles: false,
                is360: false,
                is3D: false,
                is4K: false,
                isBought: false,
                isHD: false,
                isHDR: false,
                isLive: false,
                isVR180: false,
                maxResultStreams: 0,
                maxResults: maxItems,
                maxResultsShorts: 0,
                saveSubsToKVS: false,
                startUrls: startUrls,
            };
        }
        return output;
    }

    async function handleYoutubeSubmit() {
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        status = "STARTING";
        confirmChoice = false;
        loading = true;

        let inputData = processInputData(query, searchMode);

        sendEventData({
            event: "tractor-fetch-data",
            tr_social_media: "youtube",
            tr_queries: query,
            tr_num_items_retrieved: maxItems,
        });

        submitTask({
            apifyClient,
            inputData,

            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;
                toast.info("Fetching data. This may take a while...");
                checkYoutubeStatus({ apifyClient, maxItems, runId });
            },

            onError: (err: Error) => {
                console.error(err);
                error = err.message;
                loading = false;
            },
        });
    }

    async function checkYoutubeStatus({
        apifyClient,
        maxItems,
        runId,
    }: {
        apifyClient: ApifyClient;
        maxItems: number;
        runId: string;
    }) {
        checkTaskStatus({
            apifyClient,
            runId,
            maxResults: maxItems,

            onStatusUpdate: ({
                status: currentStatus,
                dataLength,
                liveData,
            }: {
                status: string;
                dataLength: number;
                liveData: any;
            }) => {
                if (resuming && status == "RUNNING") resuming = false;

                status = currentStatus;
                outputProgress = dataLength;
                springProgress.set(outputProgress);

                headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
                rows =
                    dataLength > 0
                        ? liveData
                              .reverse()
                              .filter((d, i) => i < 100) //return 100 last items
                              .map((d) => Object.values(d))
                        : [];
            },
            onComplete: async ({
                runId,
                status: completedStatus,
            }: {
                runId: string;
                status: string;
            }) => {
                status = completedStatus;

                datasetData = await apifyClient.getDatasetInfo(runId);

                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                    omitColumns: ["comments", "descriptionLinks"],
                });

                csvBlob = await jsonToCsv({
                    url: datasetLink,
                    customColumnOrder: [
                        "date",
                        "title",
                        "channelName",
                        "numberOfSubscribers",
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyword =
                    searchMode == "search"
                        ? query.trim().replaceAll(" ", "_").replaceAll(".", "")
                        : query.split(",").map((url) => {
                              return url
                                  .replace(/.*youtube.com\/@?/g, "")
                                  .replaceAll(" ", "")
                                  .replaceAll(".", "");
                          });

                filename = await createFileName({
                    actorName: apifyClient.name,
                    information: {
                        ...processInputData(query, searchMode),
                    },
                    datasetId: datasetData.data.id,
                });

                datasetSize = datasetData.data.itemCount;

                toast.success("🎉 Dataset created. Ready to download!");

                loading = false;
            },
            onError: async (err: Error) => {
                error = err.message;
                userId = (await getPrivateUserData()).data.id;
                toast.error(err.message, {
                    duration: 10000,
                });
                loading = false;
            },
        });
    }
    let searchMode = $derived(query?.includes("youtube.com") ? "url" : "search");
    let startUrls =
        $derived(searchMode == "url" &&
        query
            .split(",")
            .map((a) => a.trim())
            .map((url) => {
                return {
                    url: url,
                    method: "GET",
                };
            }));
    let maxItemsUrls =
        $derived(searchMode == "url" ? startUrls.length * maxItems : maxItems);
    run(() => {
        console.log(maxItemsUrls);
    });
    run(() => {
        if (resuming) {
            loading = true;

            setTimeout(() => {
                checkYoutubeStatus({ apifyClient, maxItems, runId });
            }, 500);
        }
    });
    let buttonText = $derived(loading ? `Loading video data` : `Get video data`);
</script>

<Section>
    <form
        onsubmit={preventDefault(handleYoutubeSubmit)}
        class="flex flex-col gap-5"
    >
        <div class="flex flex-col gap-2">
            <div class="flex items-center mb-2 gap-1">
                <label for="search" class="text-sm text-base-content/60"
                    >Search YouTube:</label
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
                        <div class="prose prose-sm">
                            <h3>Search Mode</h3>
                            <p>
                                Search in the same way as in the youtube search
                                bar.
                            </p>

                            <p>
                                To enter <b>url mode</b>, simply paste a youtube
                                link to a video, channel, playlist, or results
                                page.
                            </p>

                            <p>
                                Date filtering is only enabled when in <b
                                    >url mode</b
                                >.
                            </p>

                            <h3>Url Mode</h3>
                            <p>
                                Search for specific video, channel, playlist or
                                results page URL.
                            </p>

                            <p>This mode enables date range filtering.</p>

                            <p>
                                You can input several links, just separate them
                                by commas.
                            </p>
                        </div>
                    </TooltipContent>
                </Tooltip.Root>
            </div>

            <div class="join">
                <Tooltip.Root openDelay={0}>
                    <Tooltip.Trigger>
                        <div
                            class="join-item btn btn-sm"
                            class:searchMode={searchMode == "search"}
                            class:urlMode={searchMode == "url"}
                        >
                            {searchMode}
                        </div>
                    </Tooltip.Trigger>
                    {#if searchMode == "search"}
                        <TooltipContent
                            align="start"
                            sideOffset={10}
                            transitionConfig={{ duration: 200, y: 5 }}
                        >
                            <div class="prose prose-sm">
                                <h4>Search Mode</h4>
                                <p>
                                    Search in the same way as in the youtube
                                    search bar.
                                </p>

                                <p>
                                    To enter <b>url mode</b>, simply paste a
                                    youtube link to a video, channel, playlist,
                                    or results page.
                                </p>
                            </div>
                        </TooltipContent>
                    {:else}
                        <TooltipContent
                            align="start"
                            sideOffset={10}
                            transitionConfig={{ duration: 200, y: 5 }}
                        >
                            <div class="prose prose-sm">
                                <h4>Url Mode</h4>
                                <p>
                                    Search for specific video, channel, playlist
                                    or results page URL.
                                </p>

                                <p>This mode enables date range filtering.</p>

                                <p>
                                    You can input several links, just separate
                                    them by commas.
                                </p>
                            </div>
                        </TooltipContent>
                    {/if}
                </Tooltip.Root>
                <input
                    type="text"
                    class="input input-sm text-sm bg-neutral w-full rounded-full
                    join-item"
                    placeholder="Search for Youtube videos or paste one or more Youtube links, separated by commas"
                    disabled={loading}
                    bind:value={query}
                />
            </div>
        </div>

        <div class="flex gap-5 items-center">
            <div class="w-fit">
                <DatePicker
                    disabled={loading || searchMode != "url"}
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
                    onclick={() => (confirmChoice = true)}
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
                <WarningCost unitPrice={5 / 1000} maxItems={maxItemsUrls} />
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

    <LiveInfo
        {apifyClient}
        {userId}
        {runId}
        {headers}
        {rows}
        {resuming}
        {status}
        {error}
        {outputProgress}
    />
</Section>

<style>
    .searchMode {
        @apply btn-primary;
    }

    .urlMode {
        @apply btn-secondary;
    }
</style>
