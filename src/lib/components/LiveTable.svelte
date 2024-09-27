<script>
    import { Tooltip } from "bits-ui";

    export let headers;
    export let rows;
</script>

{#if headers.length && rows.length}
    <div
        class="overflow-auto max-h-[300px] border border-base-content/30 rounded-btn table-zebra"
    >
        <table class="table table-sm table-pin-rows">
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
                    <tr class="hover border border-base-content/10">
                        <td class="opacity-20 text-right">{rows.length - i}</td>
                        {#each row as cell}
                            <td class="truncate max-w-[500px]">{cell}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
{/if}
