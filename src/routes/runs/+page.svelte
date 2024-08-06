<script lang="ts">
    import { getRuns } from '$lib/apifyEndpoints'

    const runs = getRuns()

    console.log(runs)
</script>

<h1 class="text-3xl font-bold">Runs</h1>
