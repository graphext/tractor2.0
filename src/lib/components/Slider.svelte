<script lang="ts">
    import { Slider } from "bits-ui";

    interface Props {
        value?: any;
        steps?: number | null;
    }

    let { value = $bindable([1]), steps = null }: Props = $props();
</script>

<div class="w-full">
    <Slider.Root
        bind:value
        step={1}
        min={1}
        max={3}
        
        class="relative flex touch-none select-none items-center"
    >
        {#snippet children({ thumbs })}
                <span
                class="relative h-2 w-full grow overflow-hidden rounded-full bg-base-300"
            >
                <Slider.Range class="absolute h-full bg-primary transition-all" />
            </span>

            {#each thumbs as thumb}
                <Slider.Thumb
                    {thumb}
                    class="block size-[13px] hover:scale-125 cursor-pointer
                    rounded-full border border-primary-content bg-primary shadow-sm
                    transition-all disabled:pointer-events-none disabled:opacity-50"
                />
            {/each}
                    {/snippet}
        </Slider.Root>
    {#if steps}
        <div class="flex justify-between">
            {#each Array(steps) as _, i}
                <span class="w-0.5 h-1 rounded-full bg-base-content/20"></span>
            {/each}
        </div>
    {/if}
</div>
