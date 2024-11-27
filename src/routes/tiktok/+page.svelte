<script lang="ts">
    import Section from "$lib/components/Section.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import { Tooltip } from "bits-ui";
    import { ApifyClient, getPrivateUserData } from "$lib/apifyEndpoints";
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
    import {
        checkTaskStatus,
        createFileName,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { toast } from "svelte-sonner";
    import type { TikTokPost } from "$lib/types";
    import LiveInfo from "$lib/components/LiveInfo.svelte";

    let apifyClient = new ApifyClient(TIKTOK_ACTOR_ID, "Tiktok Data Extractor");
    const socialMedia = "youtube";

    let maxItems = 100;
    let maxItemsWarning: number;

    let hashtagInput: string = "",
        profileInput: string = "",
        keywordInput: string = "";

    $: hashtagArray = hashtagInput
        ? hashtagInput
              .split(",")
              .filter((e) => !/^\s*$/g.test(e))
              .map((e) => e.trim().toLowerCase())
        : [];

    $: profileArray = profileInput
        ? profileInput
              .split(",")
              .filter((e) => !/^\s*$/g.test(e))
              .map((e) => e.trim().toLowerCase())
        : [];

    $: keywordArray = keywordInput
        ? keywordInput
              .split(",")
              .filter((e) => !/^\s*$/g.test(e))
              .map((e) => e.trim().toLowerCase())
        : [];

    $: maxItemsWarning =
        (hashtagArray?.length + profileArray?.length + keywordArray?.length) *
        maxItems;

    $: buttonText = loading ? `Fetching Tiktok data...` : `Get Tiktok data`;

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
    }) {
        checkTaskStatus({
            apifyClient,
            runId,
            maxResults: maxItemsWarning,

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

                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                });

                csvBlob = await jsonToCsv<TikTokPost>({
                    url: datasetLink,
                    dedupKey: "id",
                    customColumnOrder: [
                        "createTimeISO",
                        "text",
                        "webVideoUrl",
                        "playCount",
                        "shareCount",
                        "diggCount",
                        "videoMeta.coverUrl",
                        "top_5_hashtags",
                        "collectCount",
                        "commentCount",
                        "authorMeta.name",
                        "authorMeta.nickName",
                        "authorMeta.signature",
                        "authorMeta.avatar",
                        "authorMeta.profileUrl",
                        "authorMeta.following",
                        "authorMeta.heart",
                        "authorMeta.video",
                        "authorMeta.digg",
                        "hashtags",
                    ],
                    unwind: [
                        {
                            targetCol: "authorMeta",
                            fields: [
                                { field: "name" },
                                { field: "nickName" },
                                { field: "signature" },
                            ],
                        },
                        {
                            targetCol: "videoMeta",
                            fields: [{ field: "coverUrl" }],
                        },
                        {
                            targetCol: "hashtags",
                            take: 5,
                            fields: [
                                {
                                    field: "name",
                                    alias: "top_5_hashtags",
                                },
                            ],
                        },
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                filename = await createFileName({
                    actorName: apifyClient.name,
                    information: {
                        hashtags: hashtagArray,
                        profiles: profileArray,
                        resultsPerPage: maxItems,
                        searchQueries: keywordArray,
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
    async function handleTikTokSubmit() {
        loading = true;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        confirmChoice = false;
        status = "STARTING";
        error = "";

        hashtagArray = hashtagInput
            .split(",")
            .map((e) => e.trim().toLowerCase());

        profileArray = profileInput
            .split(",")
            .map((e) => e.trim().toLowerCase());

        keywordArray = keywordInput
            .split(",")
            .map((e) => e.trim().toLowerCase());

        console.log(maxItemsWarning);

        sendEventData({
            event: "tractor-fetch-data",
            tr_social_media: "tiktok",
            tr_keywords: keywordArray,
            tr_profiles: profileArray,
            tr_hashtags: hashtagArray,
            tr_posts_newer_than: selectedDate ? selectedDate.toString() : "",
            tr_num_items_retrieved: maxItems,
        });

        const inputData = {
            excludePinnedPosts: false,
            hashtags: hashtagArray,
            profiles: profileArray,
            resultsPerPage: maxItems,
            searchQueries: keywordArray,
            shouldDownloadCovers: false,
            shouldDownloadSlideshowImages: false,
            shouldDownloadSubtitles: false,
            shouldDownloadVideos: false,
        };

        if (selectedDate) {
            inputData["oldestPostDate"] = selectedDate.toString();
        }

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a while...");

                loading = true;

                checkTikTokStatus({ apifyClient, maxItems, runId });
            },
            onError: (err: Error) => {
                console.log("error");
                error = err.message;
                loading = false;
            },
        });
    }
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
                        <div class="prose prose-sm">
                            <h4>You can search Tiktok in 3 ways:</h4>
                            <ul class="flex flex-col gap-2">
                                <li>
                                    <b># Hashtags</b>: collect data about videos
                                    containing this hashtag: likes, users,
                                    followers and more.
                                </li>
                                <li>
                                    <b>Usernames</b>: get info about specific
                                    profiles and their videos
                                </li>
                                <li>
                                    <b>Keywords</b>: you can search for
                                    particular keywords. We will search for
                                    videos and profiles containing the keyword.
                                </li>
                            </ul>

                            <p>
                                You can search for multiple hashtags, usernames,
                                or keywords simultaneously. Separate each item
                                by commas. For example:
                            </p>
                            <p><b>#</b>: fyp, unboxing</p>
                            <p><b>Usernames</b>: johnseed, acmecorp</p>
                            <p><b>Keywords</b>: music, guitar</p>
                        </div>
                    </TooltipContent>
                </Tooltip.Root>
            </div>

            <div
                class="join w-full rounded-full"
                class:disabled={!$apifyKey || loading}
            >
                <label
                    class="input input-sm bg-neutral input-bordered flex w-full join-item items-center gap-2"
                >
                    <Hash weight="bold" class="opacity-70" />
                    <input
                        type="text"
                        class="grow"
                        bind:value={hashtagInput}
                        placeholder="Search Hashtags: fyp, music, unboxing"
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
                        bind:value={profileInput}
                        placeholder="Search user profiles"
                    />
                </label>

                <label
                    class="input input-sm bg-neutral w-full input-bordered flex join-item items-center gap-2"
                >
                    <MagnifyingGlass weight="bold" class="opacity-70" />
                    <input
                        type="text"
                        class="grow"
                        bind:value={keywordInput}
                        placeholder="Search Keywords: music, guitar, producer"
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
                    max={maxItemsWarning}
                    value={$springProgress}
                ></progress>
            {/if}
            {#if !confirmChoice}
                <button
                    on:click={() => (confirmChoice = true)}
                    class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                    disabled={!$apifyKey ||
                        (!profileInput && !hashtagInput && !keywordInput)}
                    class:disabled={!$apifyKey ||
                        (!profileInput && !hashtagInput && !keywordInput)}
                >
                    {#if loading}
                        <span class="loading loading-ring"></span>
                    {/if}
                    {buttonText}
                </button>
            {:else}
                <WarningCost unitPrice={4 / 1000} maxItems={maxItemsWarning} />
                <button
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey ||
                        (!profileInput && !hashtagInput && !keywordInput)}
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
