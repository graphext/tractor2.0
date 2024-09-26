<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";
    import { fly } from "svelte/transition";

    import { backOut } from "svelte/easing";

    export let apikeyPresent;

    let timeout: number;
    let interval: number;
    let cancelConfirmationProgress: number = 0;
    let confirmDelete = false;

    function resetKey(event: Event) {
        event.preventDefault();
        clearTimeout(timeout);
        clearInterval(interval);

        confirmDelete = false;
        apifyKey.set("");
    }
</script>

<div class="relative">
    <div class="opacity-0 w-fit">
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

            <progress
                out:fly={{ duration: 650, y: 10, easing: backOut }}
                class="pointer-events-none w-full opacity-100 right-0 bottom-0 mix-blend-overlay h-full absolute"
                value={cancelConfirmationProgress}
                max={1}
            ></progress>
        </button>
    {/if}
</div>

<style>
    :root {
        --progress-radius: 6px;
    }
    progress {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        background-color: transparent;
    }

    /* For Chrome and Safari */
    progress::-webkit-progress-bar {
        background-color: transparent;
        border-radius: var(--progress-radius);
    }

    progress::-webkit-progress-value {
        background-color: white;
        border-radius: var(--progress-radius);
    }

    /* For Firefox */
    progress::-moz-progress-bar {
        background-color: white;
        border-radius: var(--progress-radius);
    }
</style>
