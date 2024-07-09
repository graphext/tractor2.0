<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";
    import { toast } from "svelte-sonner";

    let key = "";

    function handleSubmit() {
        if (!key.startsWith("apify_api_")) {
            toast.error(
                "The key should start with 'apify_api_' and seemingly random characters. Check what you copied and try again.",
            );
        } else {
            apifyKey.set(key);
            key = "";
            toast.success("Key set successfully.");
        }
    }
    function resetKey(event: Event) {
        event.preventDefault();
        apifyKey.set("");
    }

    $: apikeyPresent = $apifyKey != "";

    $: placeholder = apikeyPresent
        ? "Key already set. Good to go!"
        : "Enter your Apify API key";
</script>

<form on:submit|preventDefault={handleSubmit}>
    <input
        type="text"
        bind:value={key}
        {placeholder}
        class="input input-bordered"
        class:inputDisabled={apikeyPresent}
    />
    {#if !apikeyPresent}
        <button
            type="submit"
            class:btnDisabled={apikeyPresent}
            class="btn btn-primary">Set Key</button
        >
    {/if}

    <button
        class:btnDisabled={!apikeyPresent}
        class="btn btn-error text-white"
        on:click={resetKey}
    >
        Reset API Key
    </button>
</form>

<style>
    .inputDisabled {
        @apply input-disabled;
    }
    .btnDisabled {
        @apply btn-disabled;
    }
</style>
