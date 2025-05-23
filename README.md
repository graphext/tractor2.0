# Tractor 2

Scrape twitter leveraging the power of APIFY, but with a much simpler, opinionated set of options. Download your data conveninently in a couple of clicks, ready to be used at [graphext.com](https://graphext.com).


![SCR-20241011-jlev](https://github.com/user-attachments/assets/42195f84-6ead-4607-8400-e919f49dc60e)


# Development

## Install Bun
First, install [bun](https://bun.sh) on your machine. You only need to do this once.

```shell
curl -fsSL https://bun.sh/install | bash
```


Then, clone the repository, as usual:

```shell
gh repo clone graphext/tractor2.0
```


## Install Dependencies
Go to the `tractor2.0` directory and run `bun i` to install all the dependencies. This only needs to be done once.


## Spin up Dev Env
For development, in the `tractor2.0` directory, run `bun run dev`, which will spin up the development environment.
Any changes will be reflected automatically.

# Technical Details

This application uses [SvelteKit 5](https://svelte.dev/), Typescript, [TailwindCSS](https://tailwindcss.com/) with [DaisyUI](https://daisyui.com/),
[Phosphor Icons](https://phosphoricons.com/) and [Bits UI](https://www.bits-ui.com/) as the main component library.

> Repo Structure

```
.
├── bun.lockb
├── eslint.config.js
├── package.json
├── postcss.config.js
├── README.md
├── src
│   ├── app.css
│   ├── app.d.ts
│   ├── app.html
│   ├── lib
│   │   ├── actors.ts                     <- All actor IDs are here to use throughout the app
│   │   ├── apifyEndpoints.ts             <- All Apify logic is encapsulated here
│   │   ├── components
│   │   │   ├── ApifyKeyInput.svelte
│   │   │   ├── CleanPasteInput.svelte
│   │   │   ├── CronEditor.svelte
│   │   │   ├── DatePicker.svelte
│   │   │   ├── DateRangePicker.svelte
│   │   │   ├── DownloadButton.svelte
│   │   │   ├── Error.svelte
│   │   │   ├── Footer.svelte
│   │   │   ├── Header.svelte
│   │   │   ├── HeaderNavItem.svelte
│   │   │   ├── HeadlessToast.svelte
│   │   │   ├── HoverInformation.svelte
│   │   │   ├── Indicator.svelte
│   │   │   ├── Input.svelte
│   │   │   ├── LiveInfo.svelte
│   │   │   ├── LiveTable.svelte
│   │   │   ├── ResetApiButton.svelte
│   │   │   ├── ResumeButton.svelte
│   │   │   ├── SearchableList.svelte
│   │   │   ├── Section.svelte
│   │   │   ├── Select.svelte
│   │   │   ├── SelectFrequency.svelte
│   │   │   ├── SelectLists.svelte
│   │   │   ├── Slider.svelte
│   │   │   ├── Status.svelte
│   │   │   ├── StopButton.svelte
│   │   │   ├── Task.svelte
│   │   │   ├── ThemeToggler.svelte
│   │   │   ├── TooltipContent.svelte
│   │   │   ├── TwitterScraperSetup.svelte
│   │   │   ├── TwitterSearchOptions.svelte
│   │   │   ├── User.svelte
│   │   │   └── WarningCost.svelte
│   │   ├── index.ts
│   │   ├── options.ts                    <- Options for dropdowns, like countries, lists to choose from, etc.
│   │   ├── postprocess.ts                <- Unused file
│   │   ├── stores
│   │   │   ├── apifyStore.ts
│   │   │   ├── appStateStore.ts
│   │   │   ├── store.ts
│   │   │   └── userQueryStore.ts
│   │   ├── types.ts                      <- Typescript definitions, usually for Actor outputs
│   │   └── utils.ts                      <- Utility functions, most notably, jsonToCsv
│   └── routes
│       ├── +layout.svelte
│       ├── +page.svelte
│       ├── api
│       │   ├── chat
│       │   │   ├── +server.ts
│       │   │   └── prompt.ts
│       │   ├── commonPrompt.ts            <- "Baseline prompt from which every other prompt is derived"
│       │   ├── competitors
│       │   │   ├── +server.ts
│       │   │   └── competitorsPrompt.ts
│       │   ├── descriptions
│       │   │   ├── +server.ts
│       │   │   └── descPrompt.ts
│       │   ├── ids
│       │   │   ├── +server.ts
│       │   │   └── idPrompt.ts
│       │   ├── names
│       │   │   ├── +server.ts
│       │   │   └── namesPrompt.ts
│       │   ├── openai.ts
│       │   ├── pain-points
│       │   │   ├── +server.ts
│       │   │   └── painPointsPrompt.ts
│       │   ├── schedulekw                  <- "Schedule Keyword"
│       │   │   ├── +server.ts
│       │   │   └── keywordPrompt.ts
│       │   └── seo
│       │       ├── +server.ts
│       │       └── seoPrompt.ts
│       ├── docs
│       │   └── +page.svelte
│       ├── google
│       │   └── old_page.svelte
│       ├── instagram
│       │   └── +page.svelte
│       ├── linkedin
│       │   └── +page.svelte
│       ├── lists
│       │   └── +page.svelte
│       ├── news
│       │   └── +page.svelte
│       ├── tasks
│       │   └── +page.svelte
│       ├── tiktok
│       │   └── +page.svelte
│       ├── token-info
│       │   └── +page.svelte
│       ├── twitter
│       │   └── +page.svelte
│       └── youtube
│           └── +page.svelte
├── svelte.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```


# Questions, support

If you have any questions, please write them out in the [issues](https://github.com/jesi-rgb/tractor2.0/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) section or email directly to [jesus@graphext.com](mailto:jesus@graphext.com), we'll reach out as soon as possible.

Happy scraping!
