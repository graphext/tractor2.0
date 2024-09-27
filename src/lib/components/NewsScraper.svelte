<script lang="ts">
    import Input from "./Input.svelte";
    import { ApifyClient, ApifyScheduler } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { NEWS_ACTOR_ID } from "$lib/actors";
    import SearchableList from "./SearchableList.svelte";
    import { jsonToCsv, languages } from "../utils";
    import DatePicker from "./DatePicker.svelte";
    import type { DateRange } from "bits-ui";
    import { toast } from "svelte-sonner";
    import { tweened } from "svelte/motion";
    import { cubicInOut } from "svelte/easing";
    import LiveTable from "./LiveTable.svelte";

    let keywords: string;
    let maxItems: number = 500;
    let selected = languages[0];

    let apifyClient: ApifyClient = new ApifyClient(NEWS_ACTOR_ID);

    let selectedRange: DateRange;
    let timeSteps: Date[];

    let error: string;
    let status: string;

    let datasetLink: string;
    let datasetData: any;
    let filename: string;
    let datasetSize: number;

    let loading: boolean = false;

    let headers: string[], rows: Array<string[]>;

    headers = [
        "title",
        "link",
        "source",
        "sourceUrl",
        "publishedAt",
        "loadedUrl",
        "rssLink",
        "image",
    ];

    rows = [
        [
            "Up to 600 million Facebook and Instagram passwords stored in plain text",
            "https://9to5mac.com/2024/09/27/up-to-600-million-facebook-and-instagram-passwords-stored-in-plain-text/",
            "9to5Mac",
            "https://9to5mac.com",
            "2024-09-27T11:49:00.000Z",
            "https://9to5mac.com/2024/09/27/up-to-600-million-facebook-and-instagram-passwords-stored-in-plain-text/",
            "https://news.google.com/rss/articles/CBMipgFBVV95cUxQTzZOYUR2dW1vQ1JyYjRlUEdDLUZoRVloOE9NeVZNNjhPeWxQMGswelBfRDV3NUpRMlNhblRoVk9VdDk4aDRiR1M1MU1meThTQndUTXpaYkZlTkVETkhsRzRJR2NPVEtjT2V3Tkw3WkhUY00tZWN4TjA0dFBwSHllaDZLUjMwb21FSENmZ2p5N0tFRktWUm9sYU56LXQ4WlA3cy1rNmNR?oc=5",
            "https://i0.wp.com/9to5mac.com/wp-content/uploads/sites/6/2024/09/Facebook-and-Instagram-passwords-stored-in-plain-text.jpg?resize=1200%2C628&quality=82&strip=all&ssl=1",
        ],
        [
            'Victoria Ramírez Colella on Instagram: "#reelsinstagram"',
            "https://www.instagram.com/victoriaramirez98/reel/DAaHUgCuiuE/",
            "Instagram",
            "https://www.instagram.com",
            "2024-09-27T04:58:55.000Z",
            "https://www.instagram.com/victoriaramirez98/reel/DAaHUgCuiuE/",
            "https://news.google.com/rss/articles/CBMibkFVX3lxTFB3MVBqTEtjRFBxbWV4YzJRazQ4a0FFWHE3VFYtS3MxbFA3Yjlkbmh2VXVKQjRJY1ZwZ2VYTlVMSXg4VHFJOE1Vd3lCeVkxRjJiWktNbVhhRnFlb2hfTk1KUEdxUElWWTdKbkVyUkxR?oc=5",
            "https://scontent-sea1-1.cdninstagram.com/v/t51.29350-15/461429960_562142786238277_4551415790071075838_n.jpg?stp=cmp1_dst-jpg_s640x640&_nc_cat=111&ccb=1-7&_nc_sid=18de74&_nc_ohc=OAZSAy1aLFcQ7kNvgHo2BxY&_nc_ht=scontent-sea1-1.cdninstagram.com&_nc_gid=A8_xOj3djSiQ08ZaTV6e7pP&oh=00_AYCexxbmlA3KDj7o3AE8-9UGX-HPST119DGD1n5gM-qKZQ&oe=66FC7E30",
        ],
        [
            "Omaha teens and parents react to Instagram's new restrictions",
            "https://www.ketv.com/article/omaha-parents-react-instagram-new-rules/62358539",
            "KETV Omaha",
            "https://www.ketv.com",
            "2024-09-24T23:48:00.000Z",
            "https://www.ketv.com/article/omaha-parents-react-instagram-new-rules/62358539",
            "https://news.google.com/rss/articles/CBMigwFBVV95cUxPdWxVbFlXOGdMX0ZvYlpkVW9qcS1IaVF0bmlscDV4b1hoX3JnSWdGdGN3Q0FRd2hlbjNsUlBCVmw3X2lmMWlzdEt4TFdycVZYVk92Q1h5cHlIaFZGWXVmU2hXZTJ4cHNDeXhCd2FqdEtEMmNEaXh2OXA0Qm1VMFF3TVJHTQ?oc=5",
            "https://kubrick.htvapps.com/vidthumb/89df1bbc-2c7b-40fa-9808-0d07f0b8c4e2/5201a4a9-4c55-4ed1-b165-6b4aa5a3c91f.jpg?crop=0.778xw:0.775xh;0.0698xw,0&resize=640:*",
        ],
        [
            "The viral 'Goodbye Meta AI' post on people's Instagram Stories doesn't actually protect their data",
            "https://www.yahoo.com/news/the-viral-goodbye-meta-ai-post-on-peoples-instagram-stories-doesnt-actually-protect-their-data-145916097.html",
            "Yahoo! Voices",
            "https://www.yahoo.com",
            "2024-09-25T14:59:16.000Z",
            "https://www.yahoo.com/news/the-viral-goodbye-meta-ai-post-on-peoples-instagram-stories-doesnt-actually-protect-their-data-145916097.html",
            "https://news.google.com/rss/articles/CBMi0gFBVV95cUxQc3N3YVkzaUhsX24zaUJqTGIwd1g0N1lkMDlyb1VlTWRhX29IcXN4MDNtdjBkc01wLTZwWnFyZlFTbDBKNXVKc1pjbHJPNmNqYmhxenJnR0RDbkhwZ1ZhUG1HSURoTkk3MGJacDNUemFFeFdCeEhuemQyTU1jekJwcDBYQkpyQ213YnUwbjlNQm91Q2xodEJqWnl5S3RMbDlwZzVUdnQwR05KUlBSZTRpQTVIV0RhSDlEeUxFbm41MEM4Z2ZGX09FTERlVkpxc3ZwV2c?oc=5",
            "https://s.yimg.com/ny/api/res/1.2/p3N_VwxjsGWUYNUL0siDGQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD03NDc-/https://s.yimg.com/os/creatr-uploaded-images/2024-09/9ffb27b0-7b4d-11ef-9eef-b2aff79d38cc",
        ],
        [
            "Meta’s going to put AI-generated images in your Facebook and Instagram feeds",
            "https://www.theverge.com/2024/9/25/24253329/meta-ai-generated-images-facebook-instagram-feeds",
            "The Verge",
            "https://www.theverge.com",
            "2024-09-25T17:28:39.000Z",
            "https://www.theverge.com/2024/9/25/24253329/meta-ai-generated-images-facebook-instagram-feeds",
            "https://news.google.com/rss/articles/CBMimAFBVV95cUxOZGNjVmlFRTIxRUxWQ0VkWkJONTE2TXRXODZNZDlkS3lpTTduMVUtVUhHVmZiclNldG1yVDdZT3NYWFhCVnBpMmJpVTBTUTVMM1BMMzNrY2dvOXJmSTc5eVNXMUZGR0NJaEEzZ0hZN2YtQ1dMcE44T3dQVjMtc2NIWGtYd3Z6N2hqa1BPMTNfQ1pxR1l6VlhOZg?oc=5",
            "https://cdn.vox-cdn.com/thumbor/CZqJlmrqfksvX8p3EF5AwFccJW8=/0x0:900x700/1200x628/filters:focal(465x352:466x353)/cdn.vox-cdn.com/uploads/chorus_asset/file/25638762/meta_instagram_ai_for_you.jpg",
        ],
        [
            "You Don’t Need to Share That Meta A.I. Post",
            "https://www.nytimes.com/2024/09/25/style/meta-ai-instagram-post.html",
            "The New York Times",
            "https://www.nytimes.com",
            "2024-09-25T17:23:42.000Z",
            "https://www.nytimes.com/2024/09/25/style/meta-ai-instagram-post.html",
            "https://news.google.com/rss/articles/CBMid0FVX3lxTE1BRzA3a3J2MHk0d1lBbjdpcEpUd19ldlBwdlYzWlRFdFh5Z05McjNJZVZmZjg4cEthQ21ndlM4djhnemVxMWpWdzlJREJSNU5MTkhpNEtLUWRzZjJSX1MzMkVObDZTMVZLX3VsOHl2VjdhaURzYzVn?oc=5",
            "https://static01.nyt.com/images/2024/09/25/multimedia/25META-POST-01-glvz/25META-POST-01-glvz-facebookJumbo.jpg",
        ],
        [
            "Meta has rebuilt Instagram and Facebook for its Quest headsets",
            "https://techcrunch.com/2024/09/25/meta-has-rebuilt-instagram-and-facebook-for-its-quest-headsets/",
            "TechCrunch",
            "https://techcrunch.com",
            "2024-09-25T17:36:44.000Z",
            "https://techcrunch.com/2024/09/25/meta-has-rebuilt-instagram-and-facebook-for-its-quest-headsets/",
            "https://news.google.com/rss/articles/CBMingFBVV95cUxQU21ESkQ2ZlpRUEFVMUl5S0tzV0U5M05qeXpLS2JxRnZ3OWlpSHhGV3VXejdac3lPVHJBZVNTaFBhcW5hRG03dVNiUkk0MC1LVk1udHl4QTI5TlhyRmw5MFdsWEZpcU1lM3JjTzdXNTc3ZlBVUnBvUFJtbmhQQlJBcy1heDRNZjhpOUxSR2RaU01hTlNpWTgxNjN3UkxrUQ?oc=5",
            "https://techcrunch.com/wp-content/uploads/2024/09/meta-connect.jpg?resize=1200,674",
        ],
        [
            "Talk to John Cena via Meta AI on Facebook, WhatsApp and Instagram. Here's how the feature works | Mint",
            "https://www.livemint.com/ai/artificial-intelligence/talk-to-john-cena-via-meta-ai-on-facebook-whatsapp-and-instagram-heres-how-the-feature-works-11727422530917.html",
            "Mint",
            "https://www.livemint.com",
            "2024-09-27T10:45:39.000Z",
            "https://www.livemint.com/ai/artificial-intelligence/talk-to-john-cena-via-meta-ai-on-facebook-whatsapp-and-instagram-heres-how-the-feature-works-11727422530917.html",
            "https://news.google.com/rss/articles/CBMi9wFBVV95cUxOeFNVQ0k0Nld6b3FmdnZpM01Kdmtkb2ozbndjbm85Q0U1LUtGSHRzZGdFNERFaERGcEtWdWZ5VnFlcWRZZzFvRmpZbUxZWS1TWHJvUGJBWDZKdC1mVmVQMGY2RWlNSnYyR2VYZENudENsbjJ1WlVjNU05UFp2UmtXTWNKWF9SVU8yNHRvOFZ1UHFFZnNENTYxNTlCMjE2RlBDd3pYRlphcHM0c3VnLVVkaHM0cExVVlVpaDNVSkRwMXh6UTdNSHNiT0sySEEyMHV3c1pXcFZtbG5fLXBVSERPbmVUWDhOcHViNVFKcWNEY0pySUV6MVJj0gH8AUFVX3lxTE04XzdwdXJGdWtXOENuR0ltX1F3MzIxWUFFSVI1VHFIbVpyOGltVUJhcnExM3hpYXl3blYzdDV2VUtBVUZ6Vi1TbUN0cUh6dGd2Y3BOb2YxaUpBN1FWckJPRnppWWltVHdCN3FhOWNTczJuRmxWeVlqbjE1aFRwNWloQ2lwejhaYjhrcXlxdDE0bVgzeEt4NjhxdVJHcjVXb3pkTC1XT19QU1NUMUNaNHc2UjhkUDRxZ2J1UnRvQS1uS1MtMW9EdXpRME11c1d2QjZmT0tmSHJheDhXaWZ1eDMxa2FqQjBJZkZnMGhrTUpidmNnd3p0UzF5U2FqZA?oc=5",
            "https://images.livemint.com/img/2018/12/28/1600x900/AI_1545995858117.jpg",
        ],
        [
            "Meta AI’s GenAI ‘Imagine’ features expand across Facebook, Instagram, and Messenger",
            "https://techcrunch.com/2024/09/25/meta-ais-genai-imagine-features-expand-across-facebook-instagram-and-messenger/",
            "TechCrunch",
            "https://techcrunch.com",
            "2024-09-25T17:28:15.000Z",
            "https://techcrunch.com/2024/09/25/meta-ais-genai-imagine-features-expand-across-facebook-instagram-and-messenger/",
            "https://news.google.com/rss/articles/CBMiswFBVV95cUxNTjRTX0g0dzZCblRSVktpeEQwcWc4TUhwWFh0ZDFYeGZxMTVMUFBZdVQ4YU1LYndDU1BYX2VXWDhBVkRGU1AwVlM4UnMxZGFzeTlaNEN5NXNXQkpDcmx4QXhmSEhYWnVULU1VMEg0YWk0ZHFwWGdlOG5DeXhTVkExR3Bna1BrNXZmUHZBLU5oSklEWUVxNGJNTGdIWDBSd0pnVnpsdGxYaEQwQkpGMmU4U2NXQQ?oc=5",
            "https://techcrunch.com/wp-content/uploads/2024/09/Meta-Connect-2024-09-25-at-1.28.29PM.jpg?resize=1200,703",
        ],
        [
            "AI Versions of Yourself Might Start Appearing in Your Instagram Feed",
            "https://petapixel.com/2024/09/26/ai-versions-of-yourself-might-start-appearing-in-your-instagram-feed-mark-zuckerberg-meta-connect/",
            "PetaPixel",
            "https://petapixel.com",
            "2024-09-26T11:52:28.000Z",
            "https://petapixel.com/2024/09/26/ai-versions-of-yourself-might-start-appearing-in-your-instagram-feed-mark-zuckerberg-meta-connect/",
            "https://news.google.com/rss/articles/CBMiywFBVV95cUxQMUNsTVBqajBDcmlIS0hTMGtMSXJlemNUV3FGZjVyZXA4TDdZZXNUY1VQZjZUQ044Y2h4Vk9fUmVqUWFRY0tlU0VlUTFpNEhUNjlvQ0NOT1d0UXNIMXNLbFRpWmhUQzZmdG81REtSX1NfUGZfcUF5QXdIcy1iMlNHWF9RZl9BZ1JOTDg1amprZUNrQ29uMEFwbnVkUnBSalhfSFQ0TU41enZ2Rl8xdUt1ZzczdmpYalRMZWZEbXliVlVIWm9Gb0J0Y1UxUQ?oc=5",
            "https://petapixel.com/assets/uploads/2024/09/Meta-AI.jpg",
        ],
        [
            "Meta is going to push AI-made posts into your feeds",
            "https://www.axios.com/2024/09/27/meta-ai-posts-facebook-instagram",
            "Axios",
            "https://www.axios.com",
            "2024-09-27T09:57:49.000Z",
            "https://www.axios.com/2024/09/27/meta-ai-posts-facebook-instagram",
            "https://news.google.com/rss/articles/CBMic0FVX3lxTE1uSU5UaDk5Rzh6REFGVFVBMENxemd6aldWeWlLX0JEQ0htN1Yzd0JBal9QN2hpX2drQ0RCaTBLbDZ4Q3Z4SUZieGVIVEE4QWJPUWU1OG1tUFpmQm1uUHNodGw4c3FHVkJKcTZ3MnNmUmdSc1k?oc=5",
            "https://images.axios.com/rxlNGNVCJHEUWVYXnxHGUi2sip4=/0x42:1920x1122/1366x768/2024/09/25/1727277123660.jpg",
        ],
        [
            "Kristen Bell told Instagram to ‘get rid of AI’ before she became its official voice",
            "https://www.theverge.com/2024/9/26/24253834/kristen-bell-meta-ai-voice-connect",
            "The Verge",
            "https://www.theverge.com",
            "2024-09-26T12:40:00.000Z",
            "https://www.theverge.com/2024/9/26/24253834/kristen-bell-meta-ai-voice-connect",
            "https://news.google.com/rss/articles/CBMihAFBVV95cUxNZUZ3c0xScjJ6ZWU4dHJ2WkhmekQyR3FGTWJwNHZaVFBVeGU2MFlZcTNpc044d1BqRDBuSXdMQnJBWE9IVEo1dEltZEdPVGZLbHAxQUxQRWFRM0M2ZG45N04weU9NRG83QUtnT1d4Ri0wWGJ5ZVpqMFZDUk01TzJfaTctSms?oc=5",
            "https://cdn.vox-cdn.com/thumbor/FUCqPcNDH3wW3hm3UcHF1Cn-suY=/0x0:5855x3750/1200x628/filters:focal(3003x1577:3004x1578)/cdn.vox-cdn.com/uploads/chorus_asset/file/25639863/2172054681.jpg",
        ],
    ];

    let outputProgress: number = 0;
    const springProgress = tweened(outputProgress, { easing: cubicInOut });

    let runId: string;
    let userId: string;

    let csvBlob: Blob;

    let confirmChoice = false;
    $: buttonText = loading ? "Loading news..." : "Get News";

    async function checkStatus() {
        if (!runId) return;
        loading = true;

        try {
            const runData = await apifyClient.getRunStatus(runId);

            const { data: liveData, length: dataLength } =
                await apifyClient.getDatasetContent(runId, ["guid"]);

            outputProgress = dataLength;
            headers = dataLength > 0 ? Object.keys(liveData[0]) : [];
            rows =
                dataLength > 0
                    ? liveData
                          .reverse()
                          .filter((d, i) => i < 100) //return 100 last items
                          .map((d) => Object.values(d))
                    : [];
            console.log(headers, rows);

            springProgress.set(outputProgress);

            status = runData.data.status;

            if (error) {
                throw error;
            }
            if (status === "SUCCEEDED" || status === "ABORTED") {
                toast.success("🎉 Dataset created. Ready to download!");
                datasetLink = await apifyClient.getDatasetLink(runId, "json", [
                    "guid",
                ]);

                csvBlob = await jsonToCsv(datasetLink);

                datasetData = await apifyClient.getDatasetInfo(runId);
                console.log(datasetData);

                const fileKeyWord = keywords.length
                    ? keywords.replaceAll(",", "_")
                    : keywords;
                filename = `data_TRCTR_${fileKeyWord}_${datasetData.data.id}`;

                datasetSize = datasetData.data.itemCount;

                loading = false;

                return;
            } else if (status !== "FAILED" && status !== "TIMED-OUT") {
                setTimeout(checkStatus, 2000);
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

    async function handleSubmit() {
        loading = true;
        datasetLink = "";
        outputProgress = 0;

        const inputData = {
            query: keywords
                .split(",")
                .map((kw) => kw.trim())
                .join(" OR "),
            language: selected.value,
            dateFrom: selectedRange.start?.toString(),
            dateTo: selectedRange.end?.toString(),
            maxItems: maxItems,
        };

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
</script>

<div class="">
    <form class="flex flex-col gap-5" on:submit|preventDefault={handleSubmit}>
        <div>
            <label for="keywords" class="text-sm text-base-content/60"
                >Keywords:</label
            >
            <Input
                bind:value={keywords}
                placeholder="Enter keywords separated by commas"
                disabled={loading}
            />
        </div>

        <div class="flex gap-3 justify-between">
            <div>
                <DatePicker
                    disabled={loading}
                    bind:selectedRange
                    bind:timeSteps
                />
            </div>

            <div class="w-1/3">
                <label for="language" class="text-sm text-base-content/60"
                    >Language and Region:</label
                >
                <SearchableList
                    options={languages}
                    bind:selected
                    disabled={loading}
                    placeholder="Select language and region"
                />
            </div>

            <div class="flex flex-col gap-1 items-end justify-between">
                <label for="maxItems" class="text-sm text-base-content/60"
                    >News to search for:</label
                >
                <input
                    class="input input-sm rounded-full h-[40px] tabular-nums bg-neutral text-right"
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
                    class="progress-overlay mix-blend-overlay absolute h-full rounded-full w-full opacity-40"
                    max={maxItems}
                    value={$springProgress}
                ></progress>
            {/if}
            <button
                on:click={() => (confirmChoice = true)}
                class="btn btn-primary w-full shadow-primary/20 rounded-full shadow-sm"
                disabled={!$apifyKey || !keywords}
            >
                {#if loading}
                    <span class="loading loading-spinner loading-sm"></span>
                {/if}
                {buttonText}
            </button>
        </div>
    </form>
</div>

{#if csvBlob && filename}
    <a
        href={URL.createObjectURL(csvBlob)}
        download={filename}
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

<LiveTable {headers} {rows} />
{#if error || status}
    <div>
        <div class="divider mt-3 mb-3" />
        <div class="flex justify-between items-baseline">
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
                        <span>{outputProgress} news downloaded...</span>
                        <span class="loading loading-dots loading-sm"></span>
                    {:else if status == "SUCCEEDED"}
                        <span></span>
                    {:else if status == "FAILED"}
                        <span> </span>
                    {/if}
                </div>
            {/if}
        </div>
    </div>
{/if}
