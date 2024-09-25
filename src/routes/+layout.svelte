<script lang="ts">
    import Footer from '$lib/components/Footer.svelte'
    import '../app.css'
    import { Toaster } from 'svelte-sonner'

    import { dev } from '$app/environment'
    import { inject } from '@vercel/analytics'
    import ApifyKeyInput from '$lib/components/ApifyKeyInput.svelte'
    import User from '$lib/components/User.svelte'
    import Header from '$lib/components/Header.svelte'
    import TwitterLogo from 'phosphor-svelte/lib/TwitterLogo'
    import NewspaperClipping from 'phosphor-svelte/lib/NewspaperClipping'

    inject({ mode: dev ? 'development' : 'production' })

    import { page } from '$app/stores'

    $: pageUrl = $page.route.id

    let actors = [
        { id: '/', icon: TwitterLogo, title: 'Twitter' },
        { id: '/news', icon: NewspaperClipping, title: 'Google News' }
    ]
</script>

<Toaster position="bottom-center" richColors />

<main
    class="w-[95%] subpixel-antialiased max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <Header />

    <section class="my-5 p-3 rounded-box relative bg-section">
        <ApifyKeyInput />
    </section>

    <div class="flex gap-5 items-center">
        {#each actors as actor}
            <a href={actor.id} class="group">
                <div class="flex gap-2 items-center mb-5">
                    <svelte:component
                        this={actor.icon}
                        size={28}
                        weight={pageUrl == actor.id ? 'fill' : 'regular'}
                        class="fill-primary group-hover:-rotate-12 transition-all"
                    />
                    <h2
                        class={`text-xl transition-opacity ${pageUrl == actor.id ? 'font-bold opacity-100' : 'font-normal opacity-50 hover:opacity-80'}`}
                    >
                        {actor.title}
                    </h2>
                </div>
            </a>
        {/each}
    </div>

    <slot />
    <Footer />
</main>

<style>
    .bg-section {
        @apply bg-[#f4f4f4] dark:bg-[#25272E];
    }
</style>
