<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";

    import { Drawer } from "vaul-svelte";

    import { dev } from "$app/environment";
    import { inject } from "@vercel/analytics";
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import Header from "$lib/components/Header.svelte";

    import { page } from "$app/stores";
    import ResetApiButton from "$lib/components/ResetApiButton.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { MetaTags } from "svelte-meta-tags";
    import { appState } from "$lib/stores/appStateStore";
    import {
        LinkedinLogo,
        InstagramLogo,
        GoogleLogo,
        YoutubeLogo,
        TiktokLogo,
        TwitterLogo,
        NewspaperClipping,
    } from "phosphor-svelte";

    import { getTasks } from "$lib/apifyEndpoints";
    import TaskElement from "$lib/components/Task.svelte";
    import type { Task } from "$lib/types";

    async function getUserTasks(): Promise<Task[]> {
        const data = await getTasks();

        const allTasks: Task[] = data.data.items;

        return allTasks;
    }

    $: pageUrl = $page.route.id;

    appState.set("idle");
    let actors = [
        { id: "/", icon: GoogleLogo, title: "Google" },
        { id: "/twitter", icon: TwitterLogo, title: "Twitter" },
        { id: "/tiktok", icon: TiktokLogo, title: "TikTok" },
        { id: "/instagram", icon: InstagramLogo, title: "Instagram" },
        { id: "/news", icon: NewspaperClipping, title: "Google News" },
        { id: "/linkedin", icon: LinkedinLogo, title: "LinkedIn" },
        { id: "/youtube", icon: YoutubeLogo, title: "YouTube" },
    ];

    $: apikeyPresent = $apifyKey != "";

    inject({ mode: dev ? "development" : "production" });
</script>

<Toaster position="bottom-center" richColors />

<MetaTags
    title="Tractor 2.0"
    description="Easiest way to Download & analyze Tweets"
    canonical="https://tractor.graphext.com"
    additionalLinkTags={[
        {
            rel: "icon",
            href: `/favicon-${$appState}.png`,
        },
        { rel: "apple-touch-icon", href: "apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
    ]}
    additionalMetaTags={[{ property: "theme-color", content: "#fff" }]}
    keywords={[
        "tweets",
        "analysis",
        "scraping",
        "apify",
        "graphext",
        "tractor",
    ]}
    openGraph={{
        url: "https://tractor.graphext.com",
        title: "Tractor 2.0",
        description: "Easiest way to Download & analyze Tweets",
        images: [
            {
                url: "https://tractor.graphext.com/ogimage.webp",
                width: 1200,
                height: 600,
                alt: "Tractor",
            },
        ],
    }}
    twitter={{
        handle: "@graphext",
        cardType: "summary_large_image",
        title: "Tractor",
        description: "Easiest way to Download & analyze Tweets",
        image: "https://tractor.graphext.com/ogimage.webp",
        imageAlt: "Tractor",
    }}
/>

<Drawer.Root direction="left">
    <main
        class="w-[95%] subpixel-antialiased max-w-7xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
    >
        <Header />

        <ApifyKeyInput />

        <div class="flex items-baseline gap-1 justify-between mt-10">
            <div class="flex flex-grow relative overflow-hidden">
                <div
                    class="flex gap-1 text-sm lg:text-base lg:gap-5 items-center my-5 overflow-x-scroll no-scroll relative"
                >
                    {#each actors as actor}
                        <a href={actor.id} class="group anchor-tray">
                            <div
                                class={`hover-underline-animation flex gap-2 pb-2 items-center`}
                            >
                                <svelte:component
                                    this={actor.icon}
                                    size={24}
                                    weight={pageUrl == actor.id
                                        ? "fill"
                                        : "regular"}
                                    class="fill-primary group-hover:-rotate-12 transition-all"
                                />
                                <h2
                                    class={`transition-opacity ${
                                        pageUrl == actor.id
                                            ? "font-bold opacity-100"
                                            : "font-normal opacity-50 hover:opacity-80"
                                    }`}
                                >
                                    {actor.title}
                                </h2>
                            </div>
                        </a>
                    {/each}
                </div>
                <div
                    class="absolute right-0 h-full w-5 bg-gradient-to-r
            from-transparent to-base-100"
                ></div>
            </div>

            {#if apikeyPresent}
                <div class="w-32 shrink-0">
                    <ResetApiButton {apikeyPresent} />
                </div>
            {/if}
        </div>

        <slot />

        <Footer />
    </main>

    <Drawer.Portal>
        <Drawer.Overlay class="fixed inset-0 bg-black/10 backdrop-blur-[1px]" />

        <Drawer.Content
            class="fixed bottom-0 left-0 top-0 min-w-[600px] w-[40%] overflow-y-scroll
            shadow-lg bg-base-100 p-10 flex-row rounded-r-[10px]
            h-full"
        >
            <h1 class="mt-10 text-3xl font-bold mb-3">Tasks</h1>

            {#if !$apifyKey}
                <div class="opacity-70">
                    Log in using an <a
                        class="link-hover link link-primary font-bold"
                        href="https://console.apify.com/settings/integrations"
                        >Apify key</a
                    > to see your latest tasks.
                </div>
            {/if}
            {#await getUserTasks()}
                <div>loading...</div>
            {:then tasks}
                Total tasks: <b>{tasks.length}</b>
                <ol class="my-10">
                    {#each tasks as task, i}
                        <li class="">
                            <TaskElement {task} />
                        </li>
                        {#if i < tasks.length - 1}
                            <div class="divider my-0"></div>
                        {/if}
                    {/each}
                </ol>
            {/await}
        </Drawer.Content>
    </Drawer.Portal>
</Drawer.Root>

<style>
    .hover-underline-animation {
        position: relative;
    }

    .hover-underline-animation::after {
        content: "";
        position: absolute;
        width: 100%;
        transform: scaleX(0);
        height: 2px;
        bottom: 0;
        left: 0;
        @apply bg-primary/20;
        transform-origin: bottom right;
        transition: transform 0.15s ease-in-out;
    }

    .hover-underline-animation:hover::after {
        transform: scaleX(1);
        transform-origin: bottom left;
    }
    .no-scroll {
        -ms-overflow-style: none; /* Internet Explorer 10+ */
        scrollbar-width: none; /* Firefox */
    }
    .no-scroll::-webkit-scrollbar {
        display: none;
    }
    .anchor-tray > :last-child {
        margin-right: 1em;
    }
</style>
