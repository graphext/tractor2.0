<script lang="ts">
    import { Select, Tooltip, type Selected } from "bits-ui";
    import { fly } from "svelte/transition";
    import Check from "phosphor-svelte/lib/Check";

    import Scroll from "phosphor-svelte/lib/Scroll";

    export let lists: Selected<string>[] = [];

    import { listOptions } from "$lib/utils";
</script>

<Select.Root
    preventScroll={false}
    bind:selected={lists}
    multiple={true}
    items={listOptions}
>
    <div class="flex flex-col gap-1">
        <Tooltip.Root openDelay={100}>
            <Tooltip.Trigger class="text-left">
                <Select.Label class="text-sm text-base-content/60"
                    >Add lists to your search</Select.Label
                >
            </Tooltip.Trigger>
            <Tooltip.Content
                transition={fly}
                transitionConfig={{ y: 8, duration: 150 }}
                sideOffset={8}
                class="bg-neutral z-10 shadow-md shadow-base-100 rounded-xl"
            >
                <div class="py-3 px-4 text-balance w-[350px]">
                    <p class="mb-1">
                        Lists curated by the team. Specially tuned to the
                        Spanish media with a balanced mix of politics, economics
                        and celebrities.
                    </p>

                    <p class="opacity-70">
                        Learn more about <a
                            href="/lists"
                            class="underline text-primary">the lists</a
                        >.
                    </p>
                </div>
            </Tooltip.Content>
        </Tooltip.Root>

        <Select.Trigger
            class="min-w-[320px] max-w-[500px] flex items-center pl-4 pr-2 py-1 h-[40px]  rounded-full bg-neutral"
            aria-label="Select Lists"
        >
            <Scroll weight="duotone" size={24} class="w-[24px] shrink-0" />
            <Select.Value
                class="text-xs p-1.5 ml-1 text-left whitespace-nowrap truncate"
                placeholder="Select Lists"
            />
        </Select.Trigger>
    </div>
    <Select.Content
        class="w-full backdrop-blur bg-base-200 rounded-xl shadow-md shadow-base-100 px-1 py-1 outline-none h-fit"
        transition={fly}
        transitionConfig={{ duration: 100, y: -20 }}
        sideOffset={8}
    >
        {#each listOptions as o}
            <Select.Item
                class="flex justify-between h-7 w-full select-none items-center rounded-btn px-3 text-sm outline-none transition-all duration-75 data-[highlighted]:bg-base-300 data-[disabled]:text-base-content/50"
                value={o.value}
                label={o.label}
            >
                {o.label}
                {#if lists && lists
                        .map((e) => e.label)
                        .find((e) => e == o.label)}
                    <Check weight="regular" class="fill-primary" size={20} />
                {/if}
            </Select.Item>
        {/each}
    </Select.Content>
</Select.Root>
