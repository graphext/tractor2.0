<script lang="ts">
    import CleanPasteInput from "./CleanPasteInput.svelte";
    import { toast } from "svelte-sonner";
    import { PaneGroup, Pane, PaneResizer } from "paneforge";
    import { tweened } from "svelte/motion";
    import { apifyKey } from "../stores/apifyStore";
    import { cubicInOut } from "svelte/easing";
    import DotsSixVertical from "phosphor-svelte/lib/DotsSixVertical";
    import WarningCost from "./WarningCost.svelte";
    import {
        checkTaskStatus,
        createFileName,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { ApifyClient, getPrivateUserData } from "../apifyEndpoints";

    import { TWITTER_ACT_ID } from "$lib/actors";
    import { createFunctionString } from "$lib/postprocess";
    import { userQuery } from "$lib/stores/userQueryStore";
    import type { DateRange, Selected } from "bits-ui";

    import { frequencyStore, selectedLists } from "$lib/stores/store";
    import Error from "./Error.svelte";
    import Status from "./Status.svelte";
    import DownloadButton from "./DownloadButton.svelte";
    import Select from "./Select.svelte";
    import { Newspaper, ArrowsDownUp } from "phosphor-svelte";
    import LiveInfo from "./LiveInfo.svelte";

    interface Props {
        queries?: string;
        selectedRange: DateRange;
        queriesSpreadOverTime?: string;
    }

    let {
        queries = $bindable(""),
        selectedRange,
        queriesSpreadOverTime = $bindable(""),
    }: Props = $props();

    let loading = $state(false);
    let resuming = $state(false);

    let confirmChoice = $state(false);

    let userId: string | null = $state(null);
    let runId: string | null = $state(null);
    let status: string | null = $state(null);

    let outputProgress: number = $state(0);
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let numTweets = $state(5000);
    let tweetOrder: Selected<string> = $state({
        label: "Latest",
        value: "Latest",
    });

    let headers: string[] = $state(),
        rows: Array<string[]> = $state();

    let datasetLink: string | null = null;
    let datasetData;
    let csvBlob: Blob | null = $state(null);

    let filename: string | null = $state(null);
    let datasetSize: number | null = $state(null);

    let error: string | null = $state(null);

    const apifyClient = new ApifyClient(TWITTER_ACT_ID, "Twitter/X Scraper"); // Twitter Actor ID
    const socialMedia = "Twitter";

    async function handleTwitterSubmit() {
        confirmChoice = false;
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        status = "STARTING";

        const queryList = queriesSpreadOverTime
            .split("\n")
            .filter((q) => q.trim() !== "");
        const nQueries = queriesSpreadOverTime.split("\n").length;
        const maxTweetsPerQuery = Math.ceil(numTweets / nQueries);

        const inputData = {
            searchTerms: queryList,
            maxItems: numTweets,
            maxTweetsPerQuery: maxTweetsPerQuery,
            onlyImage: false,
            onlyQuote: false,
            onlyTwitterBlue: false,
            onlyVerifiedUsers: false,
            onlyVideo: false,
            sort: tweetOrder.value,
            customMapFunction: createFunctionString(),
        };

        sendEventData({
            event: "tractor-fetch-data",
            tr_social_media: "twitter",
            tr_gpt_query: $userQuery,
            tr_user_queries: queryList,
            tr_num_items_retrieved: numTweets,
            tr_time_frequency: $frequencyStore,
            tr_date_range_start: selectedRange.start?.toString(),
            tr_date_range_end: selectedRange.end?.toString(),
            tr_lists: $selectedLists,
        });

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a while...");

                loading = true;
                // check for task status and update UI
                checkTwitterTaskStatus({ apifyClient, numTweets, runId });
            },

            //oh shoot
            onError: (err: Error) => {
                error = err.message;
                loading = false;
            },
        });
    }

    async function checkTwitterTaskStatus({
        apifyClient,
        numTweets,
        runId,
    }: {
        apifyClient: ApifyClient;
        numTweets: number;
        runId: string | null;
    }) {
        checkTaskStatus({
            apifyClient,
            runId,
            maxResults: numTweets,

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
                              .filter((d: any, i: number) => i < 100) //return 100 last items
                              .map((d: any) => Object.values(d))
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

                csvBlob = await jsonToCsv({
                    url: datasetLink,
                    dedupKey: "url<gx:url>",
                    customColumnOrder: [
                        "createdAt<gx:date>",
                        "authorName<gx:category>",
                        "text<gx:text>",
                        "url<gx:url>",
                        "viewCount<gx:number>",
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                console.log(datasetData);

                filename = await createFileName({
                    actorName: apifyClient.name,
                    information: {
                        userQuery: userQuery,
                        frequency: $frequencyStore,
                        searchTerms: queriesSpreadOverTime,
                        maxItems: numTweets,
                        sortingMethod: tweetOrder.value,
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
    let numQueries = $derived(
        queriesSpreadOverTime
            ? queriesSpreadOverTime.trim().split("\n").length
            : 0,
    );
    $effect(() => {
        if (resuming) {
            loading = true;

            setTimeout(() => {
                checkTwitterTaskStatus({ apifyClient, runId, numTweets });
            }, 500);
        }
    });
    let buttonText = $derived(loading ? "Loading tweets..." : "Get Tweets");
</script>

<form
    onsubmit={(e) => {
        e.preventDefault();
        handleTwitterSubmit();
    }}
    class="flex flex-col gap-3"
>
    <PaneGroup direction="horizontal" class="items-center gap-1 mb-4 ">
        <Pane defaultSize={60} class="p-1">
            <div
                class="text-base-content/60 overflow-x-clip whitespace-nowrap mb-1"
            >
                Main content queries
            </div>
            <CleanPasteInput
                placeholder="Generate twitter search terms in the input query generator"
                bind:value={queries}
            />
        </Pane>
        <PaneResizer class="text-base-content rounded-sm px-0 py-2">
            <DotsSixVertical
                class="hover:bg-primary hover:text-primary-content py-1
                transition-all rounded-sm"
                size={20}
                weight="bold"
            />
        </PaneResizer>
        <Pane defaultSize={40} class="p-1">
            <div
                class="text-base-content/60 overflow-x-clip whitespace-nowrap mb-1"
            >
                What's being sent ({numQueries}
                {numQueries == 1 ? "query" : "queries"})
            </div>
            <CleanPasteInput
                placeholder="Here, the queries will be spread over time"
                bind:value={queriesSpreadOverTime}
                readonly
            />
        </Pane>
    </PaneGroup>

    <div class="flex items-center justify-end gap-5">
        <Select
            bind:selected={tweetOrder}
            label="Tweet order"
            icon={ArrowsDownUp}
            options={[
                { label: "Latest", value: "Latest" },
                { label: "Top", value: "Top" },
                { label: "Media", value: "Media" },
            ]}
        />

        <div class="flex justify-between">
            <div class="flex flex-col gap-2"></div>

            <label
                for="Numtweets"
                class="self-end flex flex-col text-right gap-1"
            >
                <span class="text-sm text-base-content/60"
                    ><b>Max</b> number of tweets to fetch</span
                >
                <input
                    class="input input-sm rounded-full tabular-nums bg-neutral text-right shadow-sm"
                    inputmode="numeric"
                    bind:value={numTweets}
                    type="number"
                    id="Numtweets"
                />
            </label>
        </div>
    </div>

    <div class="w-full relative">
        {#if loading}
            <progress
                class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                max={numTweets}
                value={$springProgress}
            ></progress>
        {/if}
        {#if !confirmChoice}
            <button
                onclick={() => (confirmChoice = true)}
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-md"
                disabled={!$apifyKey || !queries}
                class:disabled={!$apifyKey || !queries}
            >
                {#if loading}
                    <span class="loading loading-ring"></span>
                {/if}
                {buttonText}
            </button>
        {:else}
            <WarningCost unitPrice={0.4 / 1000} maxItems={numTweets} />
            <button
                class="btn btn-primary w-full shadow-primary/20 shado-md rounded-full"
                disabled={!$apifyKey || !queries}
            >
                Sure. Let's go.
            </button>
        {/if}
    </div>
</form>

<DownloadButton {csvBlob} {filename} {datasetSize} {loading} {socialMedia} />

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
