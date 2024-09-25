<script lang="ts">
    import { MetaTags } from 'svelte-meta-tags'
    import ApifyKeyInput from '$lib/components/ApifyKeyInput.svelte'

    import ApifyScraper from '$lib/components/TwitterScraperSetup.svelte'
    import ChatGPTQueries from '$lib/components/ChatGPTQueries.svelte'

    import User from '$lib/components/User.svelte'
    import TwitterLogo from 'phosphor-svelte/lib/TwitterLogo'

    let queries: string
    let enrichedQueries: string
</script>

<MetaTags
    title="Tractor 2.0"
    description="Easiest way to Download & analyze Tweets"
    canonical="https://tractor.graphext.com"
    additionalLinkTags={[
        { rel: 'icon', href: '/favicon-32x32.png' },
        { rel: 'icon', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: 'apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' }
    ]}
    additionalMetaTags={[{ property: 'theme-color', content: '#fff' }]}
    keywords={[
        'tweets',
        'analysis',
        'scraping',
        'apify',
        'graphext',
        'tractor'
    ]}
    openGraph={{
        url: 'https://tractor.graphext.com',
        title: 'Tractor 2.0',
        description: 'Easiest way to Download & analyze Tweets',
        images: [
            {
                url: 'https://tractor.graphext.com/ogimage.webp',
                width: 1200,
                height: 600,
                alt: 'Tractor'
            }
        ]
    }}
    twitter={{
        handle: '@graphext',
        cardType: 'summary_large_image',
        title: 'Tractor',
        description: 'Easiest way to Download & analyze Tweets',
        image: 'https://tractor.graphext.com/ogimage.webp',
        imageAlt: 'Tractor'
    }}
/>

<div class="flex gap-3 items-center mb-5">
    <TwitterLogo class="fill-primary" weight="duotone" size={25} />
    <h2 class="text-2xl font-bold">Twitter</h2>
</div>

<section id="gpt" class="my-5 p-4 rounded-box relative bg-section outline-none">
    <div class="text-base-content/70 mb-4">QUERY GENERATION</div>
    <ChatGPTQueries bind:queries bind:enrichedQueries />
</section>

<section id="apify" class="my-5 p-3 rounded-box relative bg-section">
    <div class="mb-4 text-base-content/70">APIFY</div>

    <ApifyScraper bind:queries bind:queriesSpreadOverTime={enrichedQueries} />
</section>

<style>
    .bg-section {
        @apply bg-[#f4f4f4] dark:bg-[#25272E];
    }
</style>
