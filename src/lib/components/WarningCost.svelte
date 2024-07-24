<script>
    import { backOut } from "svelte/easing";
    import { fly } from "svelte/transition";

    export let totalApproximateCost;
</script>

<div
    class="my-2 p-3 bg-warning
    text-warning-content
    border border-warning-content/20 rounded-btn warning-container"
    in:fly={{ y: -20, duration: 400, easing: backOut }}
>
    <div class="warning-stripes"></div>
    <div class="relative z-10">
        This operation will cost, at maximum,
        <span class="font-semibold">${totalApproximateCost.toFixed(3)}</span>.
        <span class="text-sm italic text-warning-content/80">
            Actor price is <span class="font-semibold">$0.3/1K tweets</span>.
        </span>
    </div>
</div>

<style>
    .warning-container {
        position: relative;
        overflow: hidden;
    }
    .warning-stripes {
        @apply bg-warning;

        position: absolute;
        inset: 0;
        background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 2%,
            #00000010 2%,
            #00000010 4%
        );
        background-blend-mode: multiply;
        -webkit-mask-image: linear-gradient(to left, black 10%, transparent);
        mask-image: linear-gradient(to left, black, transparent 50%);
    }
    .italic {
        font-variation-settings: "ital" 12;
    }
</style>
