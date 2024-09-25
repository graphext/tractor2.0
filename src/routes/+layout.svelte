<script>
    import Footer from '$lib/components/Footer.svelte'
    import '../app.css'
    import { Toaster } from 'svelte-sonner'

    import { dev } from '$app/environment'
    import { inject } from '@vercel/analytics'
    import ApifyKeyInput from '$lib/components/ApifyKeyInput.svelte'
    import User from '$lib/components/User.svelte'

    inject({ mode: dev ? 'development' : 'production' })
</script>

<Toaster position="bottom-center" richColors />

<main
    class="w-[95%] subpixel-antialiased max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <div class="mb-6">
        <div class="flex gap-3">
            <img src="/tractor_icon.svg" width="24" alt="" />
            <h1 class="text-3xl md:text-left tracking-tight font-bold">
                Tractor
            </h1>
        </div>

        <div class="flex justify-between items-baseline">
            <h2 class="text-balance md:text-left">
                Scraping made easy. Put your Apify key, and let us do the rest.
            </h2>
            <div class="">
                <User />
            </div>
        </div>
    </div>

    <section class="my-5 p-3 rounded-box relative bg-section">
        <ApifyKeyInput />
    </section>
    <slot />
    <Footer />
</main>
