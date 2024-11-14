<script lang="ts">
    import { Slider } from "bits-ui";

    export let value = [1];
</script>

<div class="w-full">
    <Slider.Root
        bind:value
        step={1}
        min={1}
        max={3}
        let:thumbs
        class="relative flex w-full touch-none select-none items-center"
    >
        <span
            class="relative h-2 w-full grow overflow-hidden rounded-full bg-base-300"
        >
            <Slider.Range class="absolute h-full bg-primary" />
        </span>

        {#each thumbs as thumb}
            <Slider.Thumb
                {thumb}
                class="absolute block size-[20px] cursor-pointer rounded-full border
                        border-border-input bg-primary shadow-sm transition-colors
                        disabled:pointer-events-none disabled:opacity-50"
            />
        {/each}
    </Slider.Root>
</div>
