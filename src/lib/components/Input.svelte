<script lang="ts">
    let { value = "", ...other } = $props();
</script>

<input
    type="text"
    class="input input-sm text-sm bg-neutral w-full rounded-full"
    bind:value
    {...other}
/>
