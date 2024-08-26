<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";
    import { fly, slide } from "svelte/transition";
    import { toast } from "svelte-sonner";
    import { backIn, backInOut, backOut, elasticOut } from "svelte/easing";
    import { getPrivateUserData } from "$lib/apifyEndpoints";
    import { onMount } from "svelte";
    import Warning from "phosphor-svelte/lib/Warning";
    import Info from "phosphor-svelte/lib/Info";

    let key = "";

    let confirmDelete = false;

    let plan: string | null = null;

    async function getPlanId() {
        let data = await getPrivateUserData();
        plan = data.data.plan.id;
    }

    $: if ($apifyKey) {
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
    function resetKey(event: Event) {
        event.preventDefault();
        clearTimeout(timeout);
        clearInterval(interval);

        confirmDelete = false;
        apifyKey.set("");
    }

    let timeout: number;
    let interval: number;
    let cancelConfirmationProgress: number = 0;

    let apikeyPresent: boolean;
    let placeholder: string;

    onMount(() => {
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
    {:else}
        <div class="flex flex-col md:flex-row w-1/2 gap-3">
            <input
                type="text"
                bind:value={key}
                {placeholder}
                class="input input-bordered input-disabled input-sm md:w-[230px]"
                disabled={apikeyPresent}
                class:inputDisabled={apikeyPresent}
            />
        </div>
    {/if}

    <div class="w-[200px] md:w-1/2 relative self-end">
        <div class="h-fit opacity-0 w-fit">
            <button class="btn btn-sm"></button>
        </div>
        {#if !confirmDelete}
            <button
                class:btnDisabled={!apikeyPresent}
                class="btn grow no-animation opacity-40 absolute bottom-0 right-0 hover:opacity-100 w-fit hover:btn-error btn-sm btn-outline self-end"
                out:fly={{ duration: 100 }}
                in:fly={{ duration: 650, y: -10, easing: backOut }}
                on:click={() => {
                    let time = 2000;
                    confirmDelete = true;

                    timeout = setTimeout(() => {
                        confirmDelete = false;
                        clearInterval(interval);
                        cancelConfirmationProgress = 0;
                    }, time);

                    interval = setInterval(() => {
                        cancelConfirmationProgress += 1 / ((2 * time) / 10);
                    }, 1);
                }}
            >
                Reset API Token
            </button>
        {:else}
            <button
                out:fly={{ duration: 650, y: 10, easing: backOut }}
                class="btn no-animation hover:opacity-100 absolute right-0 w-fit md:w-fit btn-sm btn-error self-end bottom-0"
                on:click={resetKey}
            >
                Are you sure?
            </button>
            <progress
                out:fly={{ duration: 650, y: 10, easing: backOut }}
                class="w-[124px] pointer-events-none opacity-20 right-0 bottom-0 mix-blend-lighten dark:mix-blend-darken h-full absolute"
                value={cancelConfirmationProgress}
                max={1}
            ></progress>
        {/if}
    </div>
</div>

{#if plan === "FREE"}
    <div
        transition:slide={{ axis: "y", easing: backOut, duration: 300 }}
        class="mt-5 bg-error dark:bg-error/70 flex flex-col gap-2 shadow-sm rounded-btn py-3 px-4 border-2 border-error"
    >
        <div class="flex gap-3 items-start">
            <Warning weight="bold" size={22} class="mt-1 fill-error-content" />

            <div class="text-error-content">
                <p class="text-lg mb-3">
                    Apify does not allow remote access for FREE accounts.
                </p>

                <p>Please, sign up with a paid account and try again.</p>
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

{#if !$apifyKey}
    <div class="ml-3 hover:text-primary transition-colors">
        <a href="/token-info" class="underline opacity-70"
            >Learn more about the APIFY token</a
        >
    </div>
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
