<script lang="ts">
    import { fly } from "svelte/transition";
    import { getPrivateUserData } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";

    let name: string;

    async function getUserName() {
        let data = await getPrivateUserData();
        name = data.data.profile.name;
    }

    $: if ($apifyKey) {
        getUserName();
    }
</script>

{#if $apifyKey && name}
    <div transition:fly={{ x: 30, duration: 300 }}>
        <a
            class="hover:underline"
            href="https://console.apify.com/settings/account"
            target="_blank"
        >
            Logged as <span class="text-primary font-semibold">{name}</span>
        </a>
    </div>
{:else}
    <div class="opacity-0">
        Logged in as <span class="text-primary font-semibold">{name}</span>
    </div>
{/if}
