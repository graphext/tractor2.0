<script lang="ts">
    interface Props {
        index?: number;
        color: any;
    }

    let { index = 1, color }: Props = $props();

    const textColor = color.split("/")[0];
</script>

<div
    class={`absolute font-semibold -top-2.5 md:-top-3 -right-2.5 md:-right-3 rounded-full w-6 h-6 border border-${color} text-${textColor} text-center bg-base-100`}
>
    {index}
</div>
