<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";

    import { dev } from "$app/environment";
    import { inject } from "@vercel/analytics";
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import Header from "$lib/components/Header.svelte";
    import TwitterLogo from "phosphor-svelte/lib/TwitterLogo";
    import NewspaperClipping from "phosphor-svelte/lib/NewspaperClipping";

    import { page } from "$app/stores";
    import ResetApiButton from "$lib/components/ResetApiButton.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";
    import { MetaTags } from "svelte-meta-tags";
    import { InstagramLogo, GoogleLogo } from "phosphor-svelte";

    $: pageUrl = $page.route.id;

    let actors = [
        { id: "/", icon: TwitterLogo, title: "Twitter" },
        { id: "/instagram", icon: InstagramLogo, title: "Instagram" },
        { id: "/google", icon: GoogleLogo, title: "Google" },
        { id: "/news", icon: NewspaperClipping, title: "Google News" },
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
        { rel: "icon", href: "/favicon-32x32.png" },
        { rel: "icon", href: "/favicon-16x16.png" },
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

<main
    class="w-[95%] subpixel-antialiased max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <Header />

    <ApifyKeyInput />

    <div class="flex items-baseline justify-between mt-10">
        <div class="flex gap-6 items-center my-5">
            {#each actors as actor}
                <a href={actor.id} class="group">
                    <div
                        class={`hover-underline-animation flex gap-2 pb-2 items-center`}
                    >
                        <svelte:component
                            this={actor.icon}
                            size={24}
                            weight={pageUrl == actor.id ? "fill" : "regular"}
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

        {#if apikeyPresent}
            <div class="w-32">
                <ResetApiButton {apikeyPresent} />
            </div>
        {/if}
    </div>

    <slot />
    <Footer />
</main>

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
</style>
