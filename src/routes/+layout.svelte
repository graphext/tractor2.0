<script>
    import "../app.css";
    import { Toaster } from "svelte-sonner";
</script>

<Toaster position="bottom-left" richColors />
<main class="w-[95%] max-w-6xl mx-auto my-20">
    <slot />
</main>
