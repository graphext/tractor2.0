<script lang="ts">
    import { fly } from "svelte/transition";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import { apifyKey } from "$lib/stores/apifyStore";

    let name: string = $state();
    let apifyClient: ApifyClient | null = $state(null);

    async function getUserName() {
        if (apifyClient) {
            let data = await apifyClient.getPrivateUserData();
            name = data.data.profile.name;
        }
    }
    $effect(() => {
        if ($apifyKey) {
            apifyClient = new ApifyClient("61RPP7dywgiy0JPD0"); // Twitter Actor ID
            getUserName();
        }
    });
</script>

{#if $apifyKey && name}
    <div transition:fly={{ x: 30, duration: 300 }}>
        <a
            class="hover:underline text-right"
            href="https://console.apify.com/settings/account"
            target="_blank"
        >
            Logged in as <span class="text-primary font-semibold"
                >{name}
                <span class="font-mono font-normal opacity-50 text-base-content"
                    >({$apifyKey.slice(-4)})</span
                ></span
            >
        </a>
    </div>
{:else}
    <div class="opacity-0">
        Logged in as <span class="text-primary font-semibold">{name} </span>
    </div>
{/if}
