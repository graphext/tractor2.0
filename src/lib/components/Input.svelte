<script lang="ts">
    export let value: string = "";

    console.log($$props);
</script>

<input
    type="text"
    class="input input-sm text-sm bg-neutral w-full rounded-full"
    bind:value
    {...$$props}
    on:keydown
/>
