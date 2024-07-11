<script>
    import Footer from "$lib/components/Footer.svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";
</script>

<Toaster position="bottom-left" richColors />
<main class="w-[95%] max-w-4xl text-lg mx-auto my-20">
    <slot />
    <Footer />
</main>
