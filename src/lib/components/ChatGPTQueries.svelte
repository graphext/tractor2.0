<script lang="ts">
    import { fade } from "svelte/transition";
    let userPrompt = "";
    export let queries = "";
    let loading = false;
    let errorDisplay;

    async function generateResponse() {
        loading = true;
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            if (!res.ok) {
                errorDisplay = (await res.json()).error;
                throw new Error("Failed to fetch response. " + res.status);
            }

            const data = await res.json();
            queries = data.message;
        } catch (error) {
            console.error("Error:", error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex flex-col gap-3">
    <div class="w-full flex gap-3">
        {#if loading}
            <span class="loading loading-ring loading-lg text-secondary"></span>
        {/if}
        <div class="join w-full">
            <input
                type="text"
                class="input transition-all input-secondary w-full join-item"
                bind:value={userPrompt}
                placeholder="Enter your prompt here"
            />
            <button
                on:click={generateResponse}
                class="btn btn-secondary join-item"
                disabled={loading}
            >
                {loading ? "Generating..." : "Generate Search Terms"}
            </button>
        </div>
    </div>
    {#if loading || queries}
        <div class="w-full" in:fade>
            <textarea
                rows="5"
                bind:value={queries}
                class="response font-mono textarea textarea-secondary w-full"
            />
        </div>
    {/if}
    {#if errorDisplay}
        <div class="text-error">
            {errorDisplay}
        </div>
    {/if}
</div>
