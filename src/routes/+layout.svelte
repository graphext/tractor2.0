<script lang="ts">
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";

    import { dev } from "$app/environment";
    import { inject } from "@vercel/analytics";
    import ApifyKeyInput from "$lib/components/ApifyKeyInput.svelte";
    import User from "$lib/components/User.svelte";
    import Header from "$lib/components/Header.svelte";
    import TwitterLogo from "phosphor-svelte/lib/TwitterLogo";
    import NewspaperClipping from "phosphor-svelte/lib/NewspaperClipping";

    inject({ mode: dev ? "development" : "production" });

    import { page } from "$app/stores";
    import ResetApiButton from "$lib/components/ResetApiButton.svelte";
    import { apifyKey } from "$lib/stores/apifyStore";

    $: pageUrl = $page.route.id;

    let actors = [
        { id: "/", icon: TwitterLogo, title: "Twitter" },
        { id: "/news", icon: NewspaperClipping, title: "Google News" },
    ];

    $: apikeyPresent = $apifyKey != "";
</script>

<Toaster position="bottom-center" richColors />

<main
    class="w-[95%] subpixel-antialiased max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <Header />

    {#if !apikeyPresent}
        <ApifyKeyInput />
    {/if}

    <div class="flex items-center justify-between mt-10">
        <div class="flex gap-5 items-center my-5">
            {#each actors as actor}
                <a href={actor.id} class="group">
                    <div class="flex gap-2 items-center">
                        <svelte:component
                            this={actor.icon}
                            size={28}
                            weight={pageUrl == actor.id ? "fill" : "regular"}
                            class="fill-primary group-hover:-rotate-12 transition-all"
                        />
                        <h2
                            class={`text-xl transition-opacity ${pageUrl == actor.id ? "font-bold opacity-100" : "font-normal opacity-50 hover:opacity-80"}`}
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
