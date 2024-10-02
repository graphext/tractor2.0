<script>
    import { browser } from "$app/environment";
    import { Moon, Sun } from "phosphor-svelte";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";
    let theme = "light";
    let prefersDark;

    onMount(() => {
        const savedTheme = localStorage.getItem("theme");

        // Check if a theme is saved, otherwise use system preference
        if (savedTheme) {
            theme = savedTheme;
        } else {
            const prefersDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            theme = prefersDark ? "dark" : "light";
        }

        document.documentElement.setAttribute("data-theme", theme);
    });

    const toggleTheme = () => {
        theme = theme === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme); // Save the theme preference
    };

    $: if (browser) {
        prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        theme = prefersDark ? "dark" : "light";
    }
</script>

<button on:click={toggleTheme} class="btn btn-ghost btn-circle relative">
    {#if theme === "light"}
        <div transition:fly class="absolute">
            <Sun weight="bold" size={24} />
        </div>
    {:else}
        <div transition:fly class="absolute">
            <Moon weight="bold" size={24} />
        </div>
    {/if}
</button>

<style>
    button {
        transition: background-color 0.3s;
    }
</style>
