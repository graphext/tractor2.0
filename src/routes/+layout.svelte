<script>
    import Footer from '$lib/components/Footer.svelte'
    import '../app.css'
    import { Toaster } from 'svelte-sonner'

    import { dev } from '$app/environment'
    import { inject } from '@vercel/analytics'

    inject({ mode: dev ? 'development' : 'production' })
</script>

<Toaster position="bottom-center" richColors />

<main
    class="w-[95%] max-w-6xl mx-auto my-10 selection:bg-primary selection:text-primary-content"
>
    <slot />
    <Footer />
</main>
