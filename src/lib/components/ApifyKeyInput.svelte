<script lang="ts">
    import { apifyKey } from "$lib/stores/apifyStore";

    let key = "";

    function handleSubmit() {
        apifyKey.set(key);
        key = "";
    }
    function resetKey() {
        apifyKey.set("");
    }

    $: apikeyPresent = $apifyKey != "";

    let placeholder = apikeyPresent
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
    <button
        type="submit"
        class:btnDisabled={apikeyPresent}
        class="btn btn-primary">Set Key</button
    >
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
