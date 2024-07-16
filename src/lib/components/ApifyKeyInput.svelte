<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";
    import { fly, blur } from "svelte/transition";
    import { toast } from "svelte-sonner";
    import { backOut, elasticIn, elasticOut } from "svelte/easing";

    let key = "";

    let confirmDelete = false;

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

    $: console.log(cancelConfirmationProgress);

    let timeout: number;
    let interval: number;
    let cancelConfirmationProgress: number = 0;

    $: apikeyPresent = $apifyKey != "";

    $: placeholder = apikeyPresent
        ? "Key already set. Good to go!"
        : "Enter your Apify API key";
</script>

<div class="flex h-fit flex-row justify-between w-full gap-3">
    {#if !apikeyPresent}
        <form on:submit|preventDefault={handleSubmit}>
            <div class="flex flex-col md:flex-row gap-3">
                <input
                    type="password"
                    bind:value={key}
                    {placeholder}
                    class="input input-bordered w-full md:w-fit"
                    disabled={apikeyPresent}
                    class:inputDisabled={apikeyPresent}
                />
                {#if !apikeyPresent}
                    <button
                        type="submit"
                        class:btnDisabled={apikeyPresent}
                        class="btn btn-primary">Set Token</button
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
                class="input input-bordered md:w-fit"
                disabled={apikeyPresent}
                class:inputDisabled={apikeyPresent}
            />
        </div>
    {/if}

    <div class="w-[200px] md:w-1/2 h-full relative self-end">
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
                in:fly={{ duration: 950, y: 10, easing: elasticOut }}
                out:fly={{ duration: 650, y: 10, easing: backOut }}
                class="btn no-animation hover:opacity-100 absolute right-0 w-fit md:w-fit btn-sm btn-error self-end bottom-0"
                on:click={resetKey}
            >
                Are you sure?
            </button>
            <progress
                class="w-[124px] pointer-events-none opacity-20 right-0 bottom-0 mix-blend-lighten dark:mix-blend-darken h-full rounded-none absolute"
                value={cancelConfirmationProgress}
                max={1}
            ></progress>
        {/if}
    </div>
</div>

<style>
    .inputDisabled {
        @apply input-disabled;
    }
    .btnDisabled {
        @apply btn-disabled;
    }
</style>
