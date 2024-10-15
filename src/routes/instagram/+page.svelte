<script lang="ts">
    import { INSTAGRAM_ACTOR_ID } from "$lib/actors";
    import { ApifyClient, getPrivateUserData } from "$lib/apifyEndpoints";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import Input from "$lib/components/Input.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Section from "$lib/components/Section.svelte";
    import Select from "$lib/components/Select.svelte";
    import Status from "$lib/components/Status.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import type { InstagramComment, InstagramPost } from "$lib/types";
    import {
        checkTaskStatus,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";

    import {
        type DateValue,
        today,
        getLocalTimeZone,
    } from "@internationalized/date";
    import { type Selected, Tooltip } from "bits-ui";
    import { QuestionMark } from "phosphor-svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let apifyClient = new ApifyClient(INSTAGRAM_ACTOR_ID);

    let keywords = "";
    $: urlsLength = processInstagramInput(keywords).length;
    let loading: boolean = false;
    let maxItems = 500;
    let confirmChoice = false;

    $: buttonText = loading
        ? `Loading ${selectedResultType.label}`
        : `Get ${selectedResultType.label}`;

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let datasetLink;
    let runId: string;

    let resuming: boolean;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkInstagramTaskStatus({ apifyClient, maxItems, runId });
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

    let options: Selected<string>[] = [
        { label: "Posts", value: "posts" },
        { label: "Comments", value: "comments" },
        { label: "Details", value: "details" },
        { label: "Mentions", value: "mentions" },
        { label: "Reels", value: "stories" },
    ];
    let selectedResultType = options[0];

    function processInstagramInput(keywords: string) {
        const urls = keywords.split(",").map((u) => {
            u = u.trim();
            switch (true) {
                case u.startsWith("@"):
                    return `https://instagram.com/${u.trim().replace("@", "")}`;
                case u.startsWith("https://www.instagram.com"):
                    return u;
                default:
                    return `https://instagram.com/${u.trim().replace("@", "")}`;
            }
        });

        return urls;
    }

    async function handleInstagramSubmit() {
        loading = true;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        confirmChoice = false;
        status = "STARTING";
        error = "";

        let urls = processInstagramInput(keywords);

        sendEventData({
            event: "tractor-download",
            tr_social_media: "instagram",
            tr_url_keywords: urls,
            tr_posts_newer_than: selectedDate ? selectedDate.toString() : "",
            tr_search_type: selectedResultType,
            tr_num_items_retrieved: selectedResultType,
        });

        const inputData = {
            addParentData: true,
            directUrls: urls,
            resultsLimit: maxItems,
            resultsType: selectedResultType.value,
            searchLimit: 1,
            searchType: "hashtag",
            enhanceUserSearchWithFacebookPage: false,
            isUserReelFeedURL: false,
            isUserTaggedFeedURL: false,
        };

        if (selectedDate) {
            inputData["onlyPostsNewerThan"] = selectedDate.toString();
        }

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a while...");

                loading = true;
                checkInstagramTaskStatus({ apifyClient, maxItems, runId });
            },

            onError: (err: Error) => {
                console.log("error");
                error = err.message;
                loading = false;
            },
        });
    }

    async function checkInstagramTaskStatus({
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

                headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
                rows =
                    dataLength > 0
                        ? liveData
                              .reverse()
                              .filter((d, i) => i < 100) //return 100 last items
                              .map((d) => Object.values(d))
                        : [];

                springProgress.set(outputProgress);
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
                    includeOnly: [
                        "alt",
                        "caption",
                        "coauthorProducers",
                        "followersCount",
                        "followsCount",
                        "biography",
                        "commentsCount",
                        "displayUrl",
                        "firstComment",
                        "hashtags",
                        "likesCount",
                        "locationName",
                        "mentions",
                        "paidPartnership",
                        "taggedUsers",
                        "timestamp",
                        "type",
                        "url",
                        "videoDuration",
                        "videoPlayCount",
                        "videoViewCount",
                        "id",
                    ],
                });
                csvBlob = await jsonToCsv<InstagramPost>({
                    url: datasetLink,
                    dedupKey: "id",
                    customColumnOrder: [
                        "timestamp",
                        "caption",
                        "url",
                        "type",
                        "likesCount",
                        "commentsCount",
                    ],
                    unwind: [
                        {
                            targetCol: "coauthorProducers",
                            take: 3,
                            fields: [
                                {
                                    field: "username",
                                    alias: "coauthorProducers_username",
                                },
                            ],
                        },
                        {
                            targetCol: "taggedUsers",
                            take: 4,
                            fields: [
                                {
                                    field: "username",
                                    alias: "first_4_tagged",
                                },
                            ],
                        },
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord
                    .replaceAll("https://instagram.com/", "")
                    .replaceAll("/", "")
                    .replaceAll(".", "")
                    .replaceAll(" ", "")
                    .replaceAll("@", "")}_${datasetData.data.id}`;

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
</script>

<Section>
    <form
        class="flex flex-col gap-5"
        on:submit|preventDefault={handleInstagramSubmit}
    >
        <div>
            <div class="flex items-center mb-2 gap-1">
                <label for="keywords" class="text-sm text-base-content/60"
                    >Keywords:</label
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
            <Input
                bind:value={keywords}
                id="keywords"
                placeholder="Enter instagram usernames, urls or hashtags separated by commas"
                disabled={loading}
            />
        </div>

        <div class="flex gap-5 items-center">
            <div class="w-fit">
                <DatePicker
                    disabled={loading}
                    label={"Search posts newer than"}
                    isDateDisabled={(d) => {
                        return d > today(getLocalTimeZone());
                    }}
                    bind:selectedDate
                />
            </div>

            <div>
                <Select
                    disabled={loading}
                    label="What to search for"
                    bind:selected={selectedResultType}
                    tooltipContent={"You can choose to get posts, comments or details from Instagram URLs. Comments can only be scraped from post URLs."}
                    placeholder="Search mode"
                    {options}
                />
            </div>

            <div class="flex flex-col gap-1">
                <Tooltip.Root openDelay={0}>
                    <Tooltip.Trigger class="w-fit text-left">
                        <label
                            for="maxItems"
                            class="text-sm text-base-content/60"
                            >{selectedResultType.label} to search for:</label
                        >
                    </Tooltip.Trigger>
                    <TooltipContent transitionConfig={{ duration: 100, y: -5 }}>
                        This will return {maxItems} results for every user you include.
                        If you were to include 3 users, you will get approximately
                        {maxItems * 3} results.
                    </TooltipContent>
                </Tooltip.Root>
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral"
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
                    max={maxItems * urlsLength}
                    value={$springProgress}
                ></progress>
            {/if}
            {#if !confirmChoice}
                <button
                    on:click={() => (confirmChoice = true)}
                    class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                    disabled={!$apifyKey || !keywords}
                    class:disabled={!$apifyKey || !keywords}
                >
                    {#if loading}
                        <span class="loading loading-ring"></span>
                    {/if}
                    {buttonText}
                </button>
            {:else}
                <WarningCost unitPrice={2.3 / 1000} {maxItems} />
                <button
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !keywords}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>

    {#if csvBlob && filename}
        <DownloadButton csvBlob filename datasetSize loading />
    {/if}

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
                        <Error error userId runId />
                    {:else}
                        <p class="opacity-0">error</p>
                    {/if}

                    {#if status}
                        <Status status outputProgress />
                    {/if}
                </div>

                <LiveTable {headers} {rows} />
            </div>
        </div>
    {/if}
</Section>

<style>
    progress {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: transparent;
    }

    /* For Chrome and Safari */
    progress::-webkit-progress-bar {
        background-color: transparent;
    }

    progress::-webkit-progress-value {
        background-color: white;
    }

    /* For Firefox */
    progress::-moz-progress-bar {
        background-color: white;
    }

    .disabled {
        @apply btn-disabled shadow-none;
    }
</style>
