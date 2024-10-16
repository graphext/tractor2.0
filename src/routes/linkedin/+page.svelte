<script lang="ts">
    import { LINKEDIN_ACTOR_ID } from "$lib/actors";
    import { ApifyClient, getPrivateUserData } from "$lib/apifyEndpoints";
    import CleanPasteInput from "$lib/components/CleanPasteInput.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import LiveTable from "$lib/components/LiveTable.svelte";
    import ResumeButton from "$lib/components/ResumeButton.svelte";
    import Section from "$lib/components/Section.svelte";
    import Status from "$lib/components/Status.svelte";
    import StopButton from "$lib/components/StopButton.svelte";
    import TooltipContent from "$lib/components/TooltipContent.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { linkedInCookies } from "$lib/stores/store";
    import { type LinkedInResult } from "$lib/types";
    import {
        checkTaskStatus,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { Tooltip } from "bits-ui";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let apifyClient = new ApifyClient(LINKEDIN_ACTOR_ID);

    let urls: string,
        cookies: string,
        loading = false,
        maxItems = 100;

    $: buttonText = loading ? "Getting results" : "Get LinkedIn posts";

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let resuming: boolean;

    $: if (resuming) {
        loading = true;

        setTimeout(() => {
            checkLinkedinStatus({ apifyClient, runId, maxItems });
        }, 500);
    }

    let datasetLink: string;
    let datasetData;
    let runId: string;
    let status: string;
    let error: string;
    let csvBlob: Blob;
    let headers: string[], rows: Array<string[]>;
    let userId: string;
    let filename: string;
    let datasetSize: number;

    async function handleLinkedinSubmit() {
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        status = "STARTING";

        let urlsSplit = urls
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u != "" && u.length > 0);

        let inputData = {
            cookie: JSON.parse(cookies),
            deepScrape: true,
            limitPerSource: maxItems,
            maxDelay: 5,
            minDelay: 2,
            proxy: {
                useApifyProxy: true,
                apifyProxyGroups: [],
                apifyProxyCountry: "US",
            },
            rawData: false,
            urls: urlsSplit,
        };

        sendEventData({
            event: "tractor-download",
            tr_social_media: "linkedin",
            tr_urls: urlsSplit,
            tr_num_items_retrieved: maxItems,
        });

        console.log("submitting");

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a couple minutes...");

                loading = true;

                checkLinkedinStatus({ apifyClient, maxItems, runId });
            },
            onError: (err: Error) => {
                console.log("error");
                error = err.message;
                loading = false;
            },
        });
    }
    async function checkLinkedinStatus({
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

                let urlsSplit = urls
                    .split("\n")
                    .map((u) => u.trim())
                    .filter((u) => u != "" && u.length > 0);

                const keywords =
                    new URL(urlsSplit[0]).searchParams.get("keywords") ||
                    "linkedin_search";

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;

                datasetLink = await apifyClient.getDatasetLink({
                    runId: runId,
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
                });
                csvBlob = await jsonToCsv<LinkedInResult>({
                    url: datasetLink,
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
                            fields: [
                                { field: "type", alias: "top_5_reactions" },
                            ],
                        },
                    ],
                });

                datasetData = await apifyClient.getDatasetInfo(runId);

                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

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

    function saveCookies() {
        $linkedInCookies = cookies;
    }
    function resetCookies() {
        $linkedInCookies = "";
        cookies = "";
    }

    onMount(() => {
        if (
            $linkedInCookies != "" &&
            $linkedInCookies != undefined &&
            $linkedInCookies != null
        ) {
            cookies = $linkedInCookies!;
            console.log("onmount cookies", cookies);
        }
    });
    $: console.log("cookies", cookies);
</script>

<Section>
    <form
        class="flex flex-col gap-5"
        on:submit|preventDefault={handleLinkedinSubmit}
    >
        <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex justify-between">
                    <Tooltip.Root openDelay={0}>
                        <Tooltip.Trigger>
                            <label
                                for="keywords"
                                class="text-sm text-base-content/60"
                                >Your LinkedIn cookies:</label
                            >
                        </Tooltip.Trigger>
                        <TooltipContent
                            side="bottom"
                            align="start"
                            sideOffset={10}
                        >
                            <div class="flex flex-col gap-3">
                                <p>
                                    Cookies are used to authorize the actor with
                                    Linkedin. Without them, we cannot scrape
                                    LinkedIn.
                                </p>
                                <p>
                                    To get your cookies, you can follow
                                    <a
                                        class="underline text-primary"
                                        href="https://youtu.be/YuKp9BlVgNM"
                                    >
                                        this tutorial.</a
                                    >
                                </p>
                                <ol class="list-decimal list-inside">
                                    <li>
                                        Install <a
                                            class="underline
                                        text-primary"
                                            href="https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                                            >Cookie-Editor</a
                                        > chrome extension
                                    </li>
                                    <li>Login to your Linkedin account</li>
                                    <li>
                                        Click on the extension and export the
                                        Linkedin cookies
                                    </li>
                                    <li>Paste the copied contents here</li>
                                    <li>
                                        Click the save cookies button to the
                                        right. This way, you can skip this step
                                        next time.
                                    </li>
                                </ol>
                            </div>
                        </TooltipContent>
                    </Tooltip.Root>
                    {#if !$linkedInCookies}
                        <button
                            class="btn btn-primary rounded-full btn-xs"
                            disabled={!cookies}
                            on:click={saveCookies}>Save cookies</button
                        >
                    {:else}
                        <button
                            class="btn opacity-40 hover:opacity-100 btn-outline hover:btn-error rounded-full btn-xs"
                            on:click={resetCookies}>Reset cookies</button
                        >
                    {/if}
                </div>
                <div>
                    {#if $linkedInCookies}
                        <CleanPasteInput
                            rows={1}
                            disabled
                            placeholder="Cookies set successfully!"
                        />
                    {:else}
                        <CleanPasteInput
                            rows={2}
                            bind:value={cookies}
                            placeholder={`[ { "domain": ".linkedin.com", "expirationDate":XXXXXX.XXXXX, "hostOnly": false, "httpOnly": false, ... }, ...]`}
                        />
                    {/if}
                </div>
            </div>
            <div class="flex flex-col gap-2 w-full">
                <label for="keywords" class="text-sm text-base-content/60"
                    >LinkedIn URLs:</label
                >
                <CleanPasteInput
                    placeholder={`Each URL in its own line:
https://www.linkedin.com/search/results...
https://www.linkedin.com/search/results...
`}
                    bind:value={urls}
                />
            </div>
        </div>

        <div class="flex flex-col gap-1 items-end text-right">
            <Tooltip.Root openDelay={0}>
                <Tooltip.Trigger class="w-fit ">
                    <label for="maxItems" class="text-sm text-base-content/60"
                        >Results to search for:</label
                    >
                </Tooltip.Trigger>
                <TooltipContent transitionConfig={{ duration: 100, y: -5 }}>
                    This will return {maxItems} results for every link you include.
                    If you were to include 3 links, you will get approximately
                    {maxItems * 3} results.
                </TooltipContent>
            </Tooltip.Root>
            <input
                class="input input-sm w-40 text-right rounded-full h-[40px] tabular-nums bg-neutral"
                inputmode="numeric"
                type="number"
                id="maxItems"
                disabled={loading}
                bind:value={maxItems}
                placeholder="Enter maximum number of items"
            />
        </div>

        <div class="w-full relative">
            {#if loading}
                <progress
                    class="progress-overlay mix-blend-overlay progress absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            <button
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                disabled={!apifyKey || !urls || !cookies}
                class:disabled={!apifyKey || !urls || !cookies}
            >
                {#if loading}
                    <span class="loading loading-ring"></span>
                {/if}
                {buttonText}
            </button>
        </div>
    </form>

    <DownloadButton {csvBlob} {filename} {datasetSize} {loading} />

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
