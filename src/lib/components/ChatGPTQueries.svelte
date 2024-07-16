<script lang="ts">
    import { userQuery } from "$lib/stores/userQueryStore";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    let userPrompt = "";
    export let queries = "";
    let error = "";
    let loading = false;

    onMount(() => {
        if ($userQuery) {
            userPrompt = $userQuery;
        }
    });

    async function generateResponse() {
        $userQuery = userPrompt;
        loading = true;
        error = "";
        queries = "";

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(
                    errorData.error || `HTTP error! status: ${res.status}`,
                );
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                queries += chunk;
            }
        } catch (err) {
            console.error("Error:", err);
            error =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            toast.error(error);
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
        <form class="w-full">
            <div
                class="md:join w-full flex flex-col md:flex-row md:gap-0 gap-3"
            >
                <input
                    type="text"
                    class="input transition-all input-secondary text-sm w-full join-item"
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
        </form>
    </div>
    {#if error}
        <div class="text-error">
            {error}
        </div>
    {/if}
</div>
