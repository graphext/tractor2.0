<script lang="ts">
    import { INSTAGRAM_ACTOR_ID } from "$lib/actors";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import DatePicker from "$lib/components/DatePicker.svelte";
    import Input from "$lib/components/Input.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Section from "$lib/components/Section.svelte";
    import Select from "$lib/components/Select.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import WarningCost from "$lib/components/WarningCost.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { jsonToCsv } from "$lib/utils";

    import { type DateValue } from "@internationalized/date";
    import { type Selected, Tooltip } from "bits-ui";
    import { QuestionMark } from "phosphor-svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let apifyClient = new ApifyClient(INSTAGRAM_ACTOR_ID);

    let keywords = "";
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
            checkStatus();
        }, 500);
    }

    let status: string;
    let error: string;
    let stopping: boolean;
    let csvBlob: Blob;
    let headers: string[], rows: Array<string[]>;
    let checkStatusTimeout: number;
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

    async function handleSubmit() {
        loading = true;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        confirmChoice = false;
        status = "STARTING";

        let urls = processInstagramInput(keywords);

        if (window.dataLayer) {
            const sendEvent = {
                event: "tractor-download",
                tr_social_media: "instagram",
                tr_url_keywords: urls,
                tr_posts_newer_than: selectedDate
                    ? selectedDate.toString()
                    : "",
                tr_search_type: selectedResultType,
                tr_num_items_retrieved: selectedResultType,
            };

            window.dataLayer.push(sendEvent);
        }

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
            inputData.onlyPostsNewerThan = selectedDate.toString();
        }

        if (!$apifyKey) {
            console.error("Apify API key is not set");
            return;
        }

        toast.success("Task and run created successfully.");
        setTimeout(() => {
            toast.info("Fetching data. This may take a while...");
        }, 1500);

        try {
            const task = await apifyClient.createTask(inputData);
            runId = await apifyClient
                .runTask(task.data.id)
                .then((run) => run.data.id);

            checkStatus();
        } catch (err) {
            console.error("Error creating or running task:", err);
        }
    }

    async function checkStatus() {
        if (!runId) return;
        loading = true;

        try {
            const runData = await apifyClient.getRunStatus(runId);
            status = runData.data.status;

            if (resuming && status == "RUNNING") resuming = false;

            const { data: liveData, length: dataLength } =
                await apifyClient.getDatasetContent(runId);

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

            if (error) {
                throw error;
            }
            if (status === "SUCCEEDED" || status === "ABORTED") {
                clearTimeout(checkStatusTimeout);

                stopping = false;
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
                    format: "json",
                    includeOnly: [
                        "alt",
                        "caption",
                        "coauthorProducers",
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

                console.log(datasetLink);

                csvBlob = await jsonToCsv({
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
                            fields: [
                                {
                                    field: "username",
                                },
                            ],
                        },
                        {
                            targetCol: "taggedUsers",
                            take: 4,
                            fields: [
                                { field: "username", alias: "first_4_tagged" },
                            ],
                        },
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;

                return;
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                checkStatusTimeout = setTimeout(checkStatus, 2000);
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                loading = false;
                throw Error(
                    "Run failed, timed-out or aborted. Check the APIFY dashboard to know more.",
                );
            }
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            loading = false;
            status = "FAILED";
            userId = (await apifyClient.getPrivateUserData()).data.id;
            if (error == "Apify returned an empty dataset.") {
                toast.error(error);
            }
            console.error(err);
        }
    }
</script>

<Section>
    <form class="flex flex-col gap-5" on:submit|preventDefault={handleSubmit}>
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
                on:keyown={(e) => {
                    console.log(e);
                    console.log("yea");
                }}
            />
        </div>

        <div class="flex gap-5 items-center">
            <div class="w-fit">
                <DatePicker
                    disabled={loading}
                    label={"Search posts newer than"}
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
                <label for="maxItems" class="text-sm text-base-content/60"
                    >{selectedResultType.label} to search for:</label
                >
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
                    max={maxItems}
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
                    on:click={handleSubmit}
                    class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                    disabled={!$apifyKey || !keywords}
                >
                    Sure. Let's go.
                </button>
            {/if}
        </div>
    </form>

    {#if csvBlob && filename}
        <a
            href={URL.createObjectURL(csvBlob)}
            download={filename}
            class:disabled={loading}
            class="btn btn-outline btn-primary w-full mt-5 group rounded-full"
            >Download Dataset <span
                class="font-mono badge badge-primary badge-xs group-hover:badge-warning"
                >.csv</span
            >
            {#if datasetSize}
                — {datasetSize} rows
            {/if}
        </a>
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
                        <div class="flex items-center gap-3">
                            <p>{error}</p>
                            <a
                                href="https://console.apify.com/organization/{userId}/actors/runs/{runId}#output"
                                target="_blank"
                                class:disabled={userId == undefined ||
                                    runId == undefined}
                                class="btn btn-xs btn-error">Go to run</a
                            >
                        </div>
                    {:else}
                        <p class="opacity-0">error</p>
                    {/if}

                    {#if status}
                        <div
                            class="flex gap-3 justify-end items-end opacity-30 tabular-nums text-right"
                        >
                            <p class="mt-4">Task status: {status}</p>
                            {#if status == "RUNNING"}
                                <span
                                    >{outputProgress}
                                    {selectedResultType.label?.toLowerCase()} downloaded...</span
                                >
                                <span class="loading loading-dots loading-sm"
                                ></span>
                            {:else if status == "SUCCEEDED"}
                                <span></span>
                            {:else if status == "FAILED"}
                                <span> </span>
                            {/if}
                        </div>
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
