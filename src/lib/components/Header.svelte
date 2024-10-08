<script lang="ts">
    import User from "$lib/components/User.svelte";
    import { Book, Gauge } from "phosphor-svelte";
    import ThemeToggler from "./ThemeToggler.svelte";
</script>

<div class="flex justify-between items-center">
    <div class="flex flex-col">
        <div class="flex gap-3 w-1/3">
            <img src="/tractor_icon.svg" width="24" alt="" />
            <h1 class="text-3xl md:text-left tracking-tight font-bold">
                Tractor
            </h1>
        </div>

        <div class="">
            <User />
        </div>
    </div>

    <div class="flex gap-3 items-center">
        <a
            class="btn btn-circle btn-ghost"
            target="_blank"
            href="https://console.apify.com/actors/runs"
        >
            <Gauge size={24} weight="bold" />
        </a>

        <a href="/docs" class="btn btn-circle btn-ghost">
            <Book size={24} weight="bold" />
        </a>
        <ThemeToggler />
    </div>
</div>
