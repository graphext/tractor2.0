<script lang="ts">
    import { getPrivateUserData, getRunsForTask } from "$lib/apifyEndpoints";
    import { actorIconMap } from "$lib/options";
    import { apifyKey } from "$lib/stores/apifyStore";
    import type { Task } from "$lib/types";
    import { jsonToCsv } from "$lib/utils";
    import { Download, Link } from "phosphor-svelte";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    interface Props {
        task: Task;
    }

    let { task }: Props = $props();

    let loading = $state(false);
    let csvBlob: Blob | null = null;

    const actorToLinkMap = {
        "twitter-x-data-tweet-scraper-pay-per-result-cheapest": {
            format: "json",
            omitColumns: [
                "profile_bio_entities_description_symbols",
                "profile_bio_entities_description_urls",
                "withheldInCountries",
                "isTranslator",
                "entities_description_urls",
                "description",
            ],
            includeOnly: [
                "createdAt",
                "text",
                "url",
                "viewCount",
                "retweetCount",
                "replyCount",
                "likeCount",
                "quoteCount",
                "author",
                "lang",
                "location",
                "author.location",
                "id",
                "extendedEntities",
            ],
        },
        "free-tiktok-scraper": {
            format: "json",
        },
        "linkedin-post-search-scraper": {
            format: "json",
            omitColumns: [
                "allowedCommentersScope",
                "rootShare",
                "shareAudience",
                "shareUrn",
                "resharedPost",
                "linkedinVideo",
            ],
            unwind: ["author"],
        },
        "google-news-scraper": {
            format: "json",
            omitColumns: ["guid"],
        },
        "google-search-scraper": {
            format: "json",
            omitColumns: [
                "relatedQueries",
                "peopleAlsoAsk",
                "paidResults",
                "serpProviderCode",
                "suggestedResults",
                "hasNextPage",
                "customData",
                "paidProducts",
                "Rec",
            ],
        },
        "instagram-scraper": {
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
        },
        "youtube-scraper": {
            omitColumns: ["comments", "descriptionLinks"],
        },
    };

    const actorToBlobMap = {
        "twitter-x-data-tweet-scraper-pay-per-result-cheapest": {
            dedupKey: "id",
            //unwind: [
            //    {
            //        targetCol: "extendedEntities.media",
            //        take: 4,
            //        fields: [{ field: "media_url_https" }],
            //    },
            //],
            customColumnOrder: [
                "createdAt",
                "text",
                "url",
                "viewCount",
                "retweetCount",
                "replyCount",
                "likeCount",
                "quoteCount",
            ],
            pivot: {
                column: "extendedEntities.media",
                pivot: ["media_url_https"],
            },
            removeColumns: ["extendedEntities.media"],
        },

        "free-tiktok-scraper": {
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
        },
        "linkedin-post-search-scraper": {
            dedupKey: "url",
            customColumnOrder: [
                "postedAtISO",
                "authorFullName",
                "text",
                "numLikes",
                "authorProfileUrl",
                "authorTitle",
                "picture",
                "occupation", //these come from the top unwind
                "image",
            ],
            unwind: [
                {
                    targetCol: "comments",
                    take: 1,
                    fields: [{ field: "text", alias: "first_comment" }],
                },

                {
                    targetCol: "reactions",
                    take: 5,
                    fields: [{ field: "type", alias: "top_5_reactions" }],
                },
            ],
        },
        "google-news-scraper": {},
        "google-search-scraper": {
            unwind: [
                {
                    targetCol: "searchQuery",
                    fields: [
                        {
                            field: "term",
                        },
                        {
                            field: "url",
                        },
                    ],
                },
            ],
            pivot: {
                column: "organicResults",
                pivot: [
                    "title",
                    "url",
                    "description",
                    "emphasizedKeywords",
                    "position",
                ],
            },
            removeColumns: [
                "organicResults",
                "searchQuery.url",
                "searchQuery.device",
                "searchQuery.type",
                "searchQuery.countryCode",
                "searchQuery.languageCode",
                "searchQuery.locationUule",
                "searchQuery.resultsPerPage",
            ],
            customColumnOrder: [
                "position",
                "title",
                "url",
                "description",
                "emphasizedKeywords",
            ],
        },
        "instagram-scraper": {
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
        },
        "youtube-scraper": {
            customColumnOrder: [
                "date",
                "title",
                "channelName",
                "numberOfSubscribers",
            ],
        },
    };

    const rtf = new Intl.RelativeTimeFormat("en", {
        numeric: "auto",
    });

    function getRelativeTime(date: Date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        let relativeTime;
        if (seconds < 60) {
            relativeTime = rtf.format(-seconds, "second");
        } else if (minutes < 60) {
            relativeTime = rtf.format(-minutes, "minute");
        } else if (hours < 24) {
            relativeTime = rtf.format(-hours, "hour");
        } else {
            relativeTime = rtf.format(-days, "day");
        }

        return relativeTime;
    }

    async function getRun() {
        const data = await getRunsForTask(task.id);
        return data.data;
    }

    let userId: string | undefined = $state();

    const BASE_URL = "https://api.apify.com/v2";
    function getDatasetLink({
        runId,
        format = "json",
        omitColumns,
        includeOnly,
        unwind,
    }: {
        runId: string | null;
        format?: "csv" | "json";
        omitColumns?: string[];
        includeOnly?: string[];
        unwind?: string[];
    }) {
        const token = get(apifyKey);
        if (!token) {
            throw new Error("Apify API token is not set");
        }

        let omitColumnsParams = "";
        if (omitColumns != undefined)
            omitColumnsParams = "&omit=" + omitColumns.join(",");

        let includeOnlyParams = "";
        if (includeOnly != undefined)
            includeOnlyParams = "&fields=" + includeOnly.join(",");

        let unwindParams = "";
        if (unwind != undefined) {
            unwindParams = "&unwind=" + unwind.join(",");
        }

        let endpoint = `/actor-runs/${runId}/dataset/items?token=${token}&format=${format}&attachment=true&clean=true${omitColumnsParams}${includeOnlyParams}${unwindParams}`;

        console.log(`${BASE_URL}${endpoint}`);

        return `${BASE_URL}${endpoint}`;
    }

    async function downloadRunDataset(actName: string, runId: string) {
        const downloadLinkConfig = actorToLinkMap[actName];
        const json2CsvConfig = actorToBlobMap[actName];

        loading = true;

        const link = getDatasetLink({ runId, ...downloadLinkConfig });

        csvBlob = await jsonToCsv({ url: link, ...json2CsvConfig });

        // download blob

        const url = window.URL.createObjectURL(csvBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${actName}_${runId}.csv`;
        a.click();

        loading = false;
    }

    onMount(async () => {
        const data = await getPrivateUserData();
        userId = data.data.id;
    });
</script>

<div class="my-3">
    <div class="flex flex-col gap-1 tabular-nums mb-4">
        <div class="font-bold text-primary underline">
            <a
                href={`https://console.apify.com/organization/${userId}/actors/tasks/${task.id}/runs`}
                target="_blank">{task.name}</a
            >
        </div>
        <div class="flex gap-3 items-baseline">
            <svelte:component
                this={actorIconMap[task.actName]}
                class="self-center"
                size={20}
                weight="fill"
            />

            <span class="opacity-70"
                >{getRelativeTime(new Date(task.createdAt))}</span
            >

            <span class="opacity-50 text-[10px] font-semibold"
                >{new Date(task.createdAt).toLocaleString("en-UK")}</span
            >
        </div>
    </div>

    {#await getRun()}
        <div>loading...</div>
    {:then runs}
        {#if runs.items.length > 0}
            <div class="flex gap-5 overflow-x-scroll">
                {#each runs.items as run, i}
                    <div
                        class="border border-base-content/20 rounded-md p-2 bg-neutral/50 flex flex-col gap-3 w-fit"
                    >
                        <div class="flex gap-3">
                            <div>Run {i + 1}</div>
                        </div>

                        <div class="flex gap-3 justify-between">
                            <button
                                class="btn border-base-content/10"
                                onclick={() =>
                                    downloadRunDataset(task.actName, run.id)}
                            >
                                {#if loading}
                                    <span
                                        class="loading size-[20px] loading-xs loading-spinner"
                                    ></span>
                                {:else}
                                    <Download
                                        weight="bold"
                                        class="mx-auto"
                                        size={20}
                                    />
                                {/if}
                            </button>
                            <a
                                class="btn border-base-content/10"
                                target="_blank"
                                href={`https://console.apify.com/organization/${userId}/actors/tasks/${task.id}/runs/${run.id}#output`}
                            >
                                <Link weight="bold" class="mx-auto" size={20} />
                            </a>
                        </div>

                        <div class="flex justify-between gap-4">
                            <div class="text-xs">
                                {#if run.status == "SUCCEEDED"}
                                    <div class="badge badge-success badge-xs">
                                        OK
                                    </div>
                                {:else if run.status == "RUNNING"}
                                    <div class="badge badge-warning badge-xs">
                                        {run.status}
                                    </div>
                                {:else if run.status == "FAILED" || run.status == "ABORTED"}
                                    <div class="badge badge-error badge-xs">
                                        {run.status}
                                    </div>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="">
                <p class="opacity-70">No runs executed for this task.</p>
                <p class="opacity-40">
                    Remember that Apify deletes Run and Task data after some
                    time <a
                        href="https://docs.apify.com/platform/actors/running/runs-and-builds#data-retention"
                        target="_blank"
                        class="underline
                        font-bold text-primary opacity-100"
                        >depending on your subscription</a
                    >.
                </p>
            </div>
        {/if}
    {/await}
</div>
