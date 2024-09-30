<script>
    import { Tooltip } from "bits-ui";
    import ClipboardText from "phosphor-svelte/lib/ClipboardText";
    import { toast } from "svelte-sonner";
    import { fly, slide } from "svelte/transition";

    export let headers;
    export let rows;
</script>

{#if headers && rows && headers.length > 0 && rows.length > 0}
    <div
        in:slide={{ duration: 400 }}
        class="overflow-auto max-h-[300px] border border-base-content/30 rounded-btn table-zebra"
    >
        <table class="table table-sm">
            <thead class="border-b border-base-content">
                <tr class="font-bold">
                    <th>#</th>
                    {#each headers as h}
                        <th class="truncate">{h.toUpperCase()}</th>
                    {/each}
                </tr>
            </thead>

            <tbody>
                {#each rows as row, i}
                    <tr
                        in:slide={{ duration: 300 }}
                        class="hover border border-base-content/10"
                    >
                        <td class="opacity-20 text-right">{rows.length - i}</td>
                        {#each row as cell}
                            <td
                                on:click={() => {
                                    toast.success(
                                        "Copied cell value to clipboard",
                                    );
                                    navigator.clipboard.writeText(cell);
                                }}
                            >
                                <Tooltip.Root disableHoverableContent={true}>
                                    <Tooltip.Trigger
                                        class="max-w-[300px] truncate"
                                    >
                                        {cell}
                                    </Tooltip.Trigger>
                                    <Tooltip.Content
                                        transition={fly}
                                        transitionConfig={{
                                            duration: 100,
                                            y: 5,
                                        }}
                                    >
                                        <div
                                            class="flex gap-3 shadow-md items-center bg-primary text-white px-3 py-1 text-sm z-[9999] max-w-[800px] rounded-box"
                                        >
                                            <ClipboardText
                                                size={15}
                                                class="shrink-0"
                                                weight="bold"
                                            />
                                            <div class="truncate">
                                                {cell}
                                            </div>
                                        </div>
                                    </Tooltip.Content>
                                </Tooltip.Root>
                            </td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}
