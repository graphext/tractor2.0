<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";
    import { slide, fly } from "svelte/transition";
    import { toast } from "svelte-sonner";
    import { backOut } from "svelte/easing";
    import { ApifyClient } from "$lib/apifyEndpoints";
    import { onMount } from "svelte";
    import Warning from "phosphor-svelte/lib/Warning";
    import Section from "./Section.svelte";
    import { page } from "$app/stores";
    import { queryParam } from "sveltekit-search-params";
    import { get } from "svelte/store";

    $: pageUrl = $page.route.id;

    let key = "";
    let plan: string | null = null;
    let apifyClient: ApifyClient | null = null;

    async function getPlanId() {
        if (apifyClient) {
            let data = await apifyClient.getPrivateUserData();
            plan = data.data.plan.id;
        }
    }

    $: if ($apifyKey) {
        apifyClient = new ApifyClient("61RPP7dywgiy0JPD0"); // Twitter Actor ID
        getPlanId();
    } else {
        plan = null;
    }

    function handleSubmit() {
        if (!key.startsWith("apify_api_")) {
            toast.error(
                "The key should start with 'apify_api_' and seemingly random characters. Check what you copied and try again.",
            );
        } else {
            apifyKey.set(key);
            key = "";
            toast.success("Key set successfully.", { duration: 1300 });
        }
    }

    let timeout: number;
    let interval: number;
    let apikeyPresent: boolean;
    let placeholder: string;

    onMount(() => {
        const apifyKeyParam = get(queryParam("apifyKey"));

        if (apifyKeyParam != "" && apifyKeyParam != undefined) {
            console.log("yeah");
            $apifyKey = apifyKeyParam;
        } else {
            console.log("fuck");
        }

        apikeyPresent = $apifyKey != "";
        placeholder = apikeyPresent
            ? "Key already set. Good to go!"
            : "Enter your Apify API key";
    });

    $: apikeyPresent = $apifyKey != "";
    $: placeholder = apikeyPresent
        ? "Key already set. Good to go!"
        : "Enter your Apify API key";
</script>

{#if !apikeyPresent}
    <Section transition={fly}>
        <div
            class:keyEntered={apikeyPresent}
            class="flex h-fit flex-col md:flex-row justify-between items-center w-full p-2 gap-3"
        >
            {#if !apikeyPresent}
                <form on:submit|preventDefault={handleSubmit}>
                    <div
                        class="flex flex-col md:join md:flex-row md:rounded-full h-fit"
                    >
                        <input
                            type="password"
                            bind:value={key}
                            {placeholder}
                            class="input input-bordered input-sm join-item w-full md:w-fit"
                            disabled={apikeyPresent}
                            class:inputDisabled={apikeyPresent}
                        />
                        {#if !apikeyPresent}
                            <button
                                type="submit"
                                class:btnDisabled={apikeyPresent}
                                class="btn btn-primary join-item btn-sm h-[10px]"
                                >Set Token</button
                            >
                        {/if}
                    </div>
                </form>
            {/if}

            {#if !$apifyKey}
                <div class="ml-3 hover:text-primary transition-colors">
                    <a href="/token-info" class="underline opacity-70"
                        >Learn more about the APIFY token</a
                    >
                </div>
            {/if}
        </div>
    </Section>
{/if}

{#if plan === "FREE" && pageUrl == "/"}
    <div
        transition:slide={{
            axis: "y",
            easing: backOut,
            duration: 300,
        }}
        class="mt-5 bg-error dark:bg-error/70 flex flex-col gap-2 shadow-sm rounded-btn py-3 px-4 border-2 border-error"
    >
        <div class="flex gap-3 items-start">
            <Warning weight="bold" size={22} class="mt-1 fill-error-content" />

            <div class="text-error-content">
                <p class="text-lg mb-3">
                    Our Twitter scraper does not allow remote access for FREE
                    accounts.
                </p>

                <p>Please, sign up with a paid account and try again.</p>
                <p>You may also check out other actors available.</p>
                <p>
                    <button
                        class="underline font-bold"
                        on:click={() => {
                            navigator.clipboard.writeText("jesus@graphext.com");
                            toast.success(
                                "Copied email 'jesus@graphext.com' to clipboard. Reach out if you need any help.",
                            );
                        }}
                    >
                        Ask the team</button
                    > for help if needed.
                </p>
            </div>
        </div>
    </div>
{:else}
    <span></span>
{/if}

<style>
    .inputDisabled {
        @apply input-disabled;
    }
    .btnDisabled {
        @apply btn-disabled;
    }
    .keyEntered {
        @apply flex-row;
    }
</style>
