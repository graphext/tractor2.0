<script>
    export let index = 1;
    export let color = "primary";
</script>

<div
    class={`absolute font-semibold -top-2.5 md:-top-3 -right-2.5 md:-right-3 rounded-full w-6 h-6 border border-${color}/30 text-${color} text-center bg-base-100`}
>
    {index}
</div>
