<script lang="ts">
    import { LINKEDIN_ACTOR_ID } from "$lib/actors";
    import { ApifyClient, getPrivateUserData } from "$lib/apifyEndpoints";
    import CleanPasteInput from "$lib/components/CleanPasteInput.svelte";
    import DownloadButton from "$lib/components/DownloadButton.svelte";
    import Error from "$lib/components/Error.svelte";
    import LiveInfo from "$lib/components/LiveInfo.svelte";
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
        createFileName,
        jsonToCsv,
        sendEventData,
        submitTask,
    } from "$lib/utils";
    import { Tooltip } from "bits-ui";
    import { QuestionMark, ExclamationMark } from "phosphor-svelte";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { cubicInOut, quartInOut } from "svelte/easing";
    import { tweened } from "svelte/motion";

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    function wiggle(node, { duration = 600, angle = 10, scaleAmount = 1.3 }) {
        return {
            duration,
            css: (t: number) => {
                const shake = Math.sin(t * Math.PI * 4) * angle;
                const scale = 1 + Math.sin(t * Math.PI) * (scaleAmount - 1);
                return `transform: scale(${scale}) rotate(${shake}deg);
        `;
            },
            easing: quartInOut,
        };
    }

    let apifyClient = new ApifyClient(
        LINKEDIN_ACTOR_ID,
        "LinkedIn Posts Scraper",
    );

    const socialMedia = "linkedin";

    let urls: string,
        loading = false,
        maxItems = 100;

    let urlsSplit: string[] = [];
    $: if (urls) {
        urlsSplit = urls
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u != "" && u.length > 0);
    }

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

    let cookieTextAreaValue: string;

    async function handleLinkedinSubmit() {
        datasetLink = "";
        filename = "";
        outputProgress = 0;
        status = "STARTING";
        loading = true;

        let inputData;
        try {
            inputData = {
                cookie: JSON.parse($linkedInCookies),
                deepScrape: true,
                limitPerSource: maxItems,
                maxDelay: 10,
                minDelay: 2,
                proxy: {
                    useApifyProxy: true,
                    apifyProxyGroups: [],
                    apifyProxyCountry: "US",
                },
                rawData: false,
                urls: urlsSplit,
            };
        } catch (e: any) {
            error = e.mesage;
            console.error(e);
            if (e.message.includes("JSON.parse:"))
                toast.error(
                    "There was a problem with your cookies. Please, reset them and try again",
                    { duration: 10000 },
                );
            $linkedInCookies = "";
            loading = false;
            status = "";
            return;
        }
        sendEventData({
            event: "tractor-fetch-data",
            tr_social_media: "linkedin",
            tr_urls: urlsSplit,
            tr_num_items_retrieved: maxItems,
        });

        submitTask({
            apifyClient,
            inputData,
            onTaskCreated: (createdRunId: string) => {
                runId = createdRunId;

                toast.info("Fetching data. This may take a couple minutes...");

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

                filename = await createFileName({
                    actorName: apifyClient.name,
                    information: {
                        urls: urlsSplit,
                        limitPerSource: maxItems,
                        maxDelay: 10,
                        minDelay: 2,
                        proxy: {
                            useApifyProxy: true,
                            apifyProxyGroups: [],
                            apifyProxyCountry: "US",
                        },
                        rawData: false,
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

    function saveCookies() {
        $linkedInCookies = cookieTextAreaValue;
    }
    function resetCookies() {
        $linkedInCookies = "";
    }
</script>

<Section>
    <form
        class="flex flex-col gap-5"
        on:submit|preventDefault={handleLinkedinSubmit}
    >
        <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2 w-full">
                <div class="flex justify-between">
                    <div class="flex items-center gap-1">
                        <label
                            for="keywords"
                            class="text-sm text-base-content/60"
                            >Your LinkedIn cookies:</label
                        >
                        <Tooltip.Root openDelay={0}>
                            <Tooltip.Trigger>
                                <QuestionMark
                                    size={20}
                                    weight="bold"
                                    class="rounded-full bg-neutral border-2 border-base-300"
                                />
                            </Tooltip.Trigger>
                            <TooltipContent
                                side="bottom"
                                sideOffset={10}
                                transitionConfig={{ duration: 100, y: -5 }}
                            >
                                <div
                                    class="prose prose-sm prose-a:text-primary
                                    prose-a:font-bold"
                                >
                                    <p>
                                        Cookies are used to authorize the actor
                                        with Linkedin. Without them, we cannot
                                        scrape LinkedIn.
                                    </p>
                                    <p>
                                        To get your cookies, you can follow
                                        <a href="https://youtu.be/YuKp9BlVgNM">
                                            this tutorial.</a
                                        >
                                    </p>
                                    <ol class="list-decimal list-inside">
                                        <li>
                                            Install the <a
                                                href="https://chromewebstore.google.com/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm"
                                                >Cookie-Editor</a
                                            > chrome extension
                                        </li>
                                        <li>Login to your Linkedin account</li>
                                        <li>
                                            Click on the extension and export
                                            the Linkedin cookies
                                        </li>
                                        <li>Paste the copied contents here</li>
                                        <li>
                                            Click the save cookies button to the
                                            right. This way, you can skip this
                                            step next time.
                                        </li>
                                    </ol>
                                </div>
                            </TooltipContent>
                        </Tooltip.Root>

                        <Tooltip.Root openDelay={0}>
                            <Tooltip.Trigger class="w-min">
                                {#if mounted}
                                    <div
                                        in:wiggle={{
                                            duration: 800,
                                            angle: $linkedInCookies ? 0 : 40,
                                            scaleAmount: $linkedInCookies
                                                ? 1
                                                : 1.9,
                                        }}
                                    >
                                        <ExclamationMark
                                            size={20}
                                            weight="bold"
                                            class="rounded-full bg-warning/5 border-2
                                    border-warning/15 fill-orange-400
                                    hover:fill-warning-content hover:bg-warning transition-all"
                                        />
                                    </div>
                                {/if}
                            </Tooltip.Trigger>
                            <TooltipContent
                                side="right"
                                sideOffset={10}
                                transitionConfig={{ duration: 100, y: -5 }}
                            >
                                <div
                                    class="prose prose-sm prose-a:text-primary
                                    prose-a:font-bold"
                                >
                                    <p>
                                        Scraping too much content can lead to
                                        temporal or permanent bans on your
                                        account.
                                    </p>
                                    <p>
                                        Neither Tractor nor Graphext are
                                        responsible for any consecuences it may
                                        bring.
                                    </p>
                                    <p>
                                        To ensure uninterrupted scraping and
                                        avoid any problems with LinkedIn, here
                                        are a few tips:
                                    </p>
                                    <ul>
                                        <li>
                                            Leave <b
                                                >sufficient time in between runs</b
                                            >: a minimum of 5 minutes is enough
                                        </li>
                                        <li>
                                            <b
                                                >Do not use LinkedIn on your
                                                browser while you are scraping</b
                                            >, as it would seem like you are
                                            using it from two computers at the
                                            same time
                                        </li>
                                        <li>
                                            Creating new <span class="italic"
                                                >fake</span
                                            >
                                            accounts usually does not work. These
                                            accounts
                                            <b>get banned and deleted easily</b
                                            >.
                                        </li>
                                    </ul>

                                    <p>
                                        On top of that, Tractor configures this
                                        LinkedIn actor to perform a random delay
                                        in between each piece of data it gets,
                                        to simulate a more organic use.
                                    </p>
                                </div>
                            </TooltipContent>
                        </Tooltip.Root>
                    </div>
                    {#if !$linkedInCookies}{:else}
                        <div
                            class="btn opacity-40 hover:opacity-100 btn-outline hover:btn-error rounded-full btn-xs"
                            tabindex="-1"
                            role="button"
                            on:click={resetCookies}
                        >
                            Reset cookies
                        </div>
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
                            bind:value={cookieTextAreaValue}
                            placeholder={`[ { "domain": ".linkedin.com", "expirationDate":XXXXXX.XXXXX, "hostOnly": false, "httpOnly": false, ... }, ...]`}
                        />
                    {/if}
                </div>
            </div>

            {#if !$linkedInCookies}
                <button
                    class="btn btn-primary rounded-full"
                    disabled={!cookieTextAreaValue}
                    on:click={saveCookies}
                >
                    Save cookies
                </button>
            {/if}

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
                    disabled={loading}
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
                    max={maxItems * urlsSplit.length}
                    value={$springProgress}
                ></progress>
            {/if}
            <button
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                disabled={!$apifyKey || !urls || !$linkedInCookies}
                type="submit"
                class:disabled={!$apifyKey || !urls || !$linkedInCookies}
            >
                {#if loading}
                    <span class="loading loading-ring"></span>
                {/if}
                {buttonText}
            </button>
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
