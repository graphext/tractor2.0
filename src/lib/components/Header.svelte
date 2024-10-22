<script lang="ts">
    import User from "$lib/components/User.svelte";
    import { Book, Gauge, FileText } from "phosphor-svelte";
    import ThemeToggler from "./ThemeToggler.svelte";
    import HeaderNavItem from "./HeaderNavItem.svelte";
</script>

<div class="flex justify-between items-center mb-5">
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

    <div class="flex gap-5 items-center">
        <HeaderNavItem icon={FileText} url="/tasks" tooltipContent="Tasks" />
        <HeaderNavItem
            icon={Gauge}
            url="https://console.apify.com/actors/runs"
            tooltipContent="Go to Apify Dashboard"
        />
        <HeaderNavItem icon={Book} url="/docs" tooltipContent="Documentation" />

        <ThemeToggler />
    </div>
</div>
