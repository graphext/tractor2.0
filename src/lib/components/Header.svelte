<script lang="ts">
  import User from "$lib/components/User.svelte";
  import {
    Book,
    Gauge,
    FileText,
    File,
    ClockCounterClockwise,
  } from "phosphor-svelte";
  import ThemeToggler from "./ThemeToggler.svelte";
  import HeaderNavItem from "./HeaderNavItem.svelte";
  import { onMount } from "svelte";
  import { getLimits } from "$lib/apifyEndpoints";
  import TooltipContent from "./TooltipContent.svelte";
  import { Tooltip } from "bits-ui";
  import { apifyKey } from "$lib/stores/apifyStore";
  import { Drawer } from "vaul-svelte";

  let currentSpent = 0;
  let maxLimitUsd = 0;
  let monthCycle: { start: string; end: string } = { start: "", end: "" };
  onMount(async () => {
    const data = await getLimits();
    currentSpent = data.data.current.monthlyUsageUsd;
    maxLimitUsd = data.data.limits.maxMonthlyUsageUsd;
    monthCycle.start = new Date(
      data.data.monthlyUsageCycle.startAt,
    ).toLocaleDateString();
    monthCycle.end = new Date(
      data.data.monthlyUsageCycle.endAt,
    ).toLocaleDateString();
  });
</script>

<div class="flex justify-between items-center mb-5">
  <div class="flex flex-col">
    <a href="/">
      <div class="flex gap-3 w-1/3">
        <img src="/tractor_icon.svg" width="24" alt="" />
        <h1 class="text-3xl md:text-left tracking-tight font-bold">Tractor</h1>
      </div>
    </a>

    {#if $apifyKey}
      <div class="flex flex-col gap-1">
        <User />
        <div class="flex items-center gap-3">
          <progress
            class="progress progress-sm h-[5px] hover:h-[10px] transition-all"
            value={currentSpent}
            max={maxLimitUsd}
          ></progress>
          <Tooltip.Root openDelay={200}>
            <Tooltip.Trigger class="shrink-0">
              <div class="text-[10px] text-right">
                ${currentSpent.toFixed(2)} /
                <span class="opacity-60">${maxLimitUsd.toFixed(2)}</span>
              </div>
            </Tooltip.Trigger>
            <TooltipContent
              side="bottom"
              sideOffset={8}
              transitionConfig={{ duration: 100, y: -5 }}
            >
              <div class="block">
                <span class="opacity-70">Current monthly usage:</span>
                <strong>${currentSpent.toFixed(2)}</strong>
                <span class="opacity-70">out of</span>
                <strong>${maxLimitUsd.toFixed(2)}</strong>.
                <br />
                <br />
                <span class="opacity-70">Your billing cycle starts on</span>
                <strong>{monthCycle.start}</strong>
                <span class="opacity-70">and ends on</span>
                <strong>{monthCycle.end}</strong>.
              </div>
            </TooltipContent>
          </Tooltip.Root>
        </div>
      </div>
    {/if}
  </div>

  <div class="flex gap-5 items-center">
    <Drawer.Trigger>
      <Tooltip.Root openDelay={30}>
        <Tooltip.Trigger>
          <button
            class="btn btn-circle btn-ghost border border-base-content/10 shadow-sm text-base-content/60 hover:text-base-content/80"
          >
            <ClockCounterClockwise size={24} weight="bold" />
          </button>
        </Tooltip.Trigger>

        <TooltipContent transitionConfig={{ duration: 100, y: -5 }}>
          Recent Tasks
        </TooltipContent>
      </Tooltip.Root>
    </Drawer.Trigger>
    <HeaderNavItem
      icon={Gauge}
      url="https://console.apify.com/actors/runs"
      tooltipContent="Go to Apify Dashboard"
    />
    <HeaderNavItem icon={Book} url="/docs" tooltipContent="Documentation" />

    <ThemeToggler />
  </div>
</div>
