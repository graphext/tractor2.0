<script>
    import Footer from '$lib/components/Footer.svelte'
    import '../app.css'
    import { Toaster } from 'svelte-sonner'

    import { dev } from '$app/environment'
    import { inject } from '@vercel/analytics'
    import ApifyKeyInput from '$lib/components/ApifyKeyInput.svelte'
    import User from '$lib/components/User.svelte'
    import Header from '$lib/components/Header.svelte'

    inject({ mode: dev ? 'development' : 'production' })
</script>

<Toaster position="bottom-center" richColors />

<main
    class="w-[95%] subpixel-antialiased max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <Header />

    <section class="my-5 p-3 rounded-box relative bg-section">
        <ApifyKeyInput />
    </section>
    <slot />
    <Footer />
</main>
