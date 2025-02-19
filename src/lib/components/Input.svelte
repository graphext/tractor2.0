<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
    export let value: string = "";
</script>

<input
    type="text"
    class="input input-sm text-sm bg-neutral w-full rounded-full"
    bind:value
    {...$$props}
/>
