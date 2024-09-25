<script lang="ts">
    import User from '$lib/components/User.svelte'
    import NewspaperClipping from 'phosphor-svelte/lib/NewspaperClipping'
    import TwitterLogo from 'phosphor-svelte/lib/TwitterLogo'
</script>

<div class="flex justify-between items-center">
    <div class="flex flex-col">
        <div class="flex gap-3 w-1/3">
            <img src="/tractor_icon.svg" width="24" alt="" />
            <h1 class="text-3xl md:text-left tracking-tight font-bold">
                Tractor
            </h1>
        </div>

        <div class="">
            <User />
        </div>
    </div>

    <div class="flex gap-10 justify-end w-1/3 items-center">
        <a href="/" class="btn btn-circle hover:btn-primary">
            <TwitterLogo weight="duotone" size={30} />
        </a>
        <a href="/news" class="btn btn-circle hover:btn-primary">
            <NewspaperClipping weight="duotone" size={30} />
        </a>
    </div>
</div>
