import { writable } from "svelte/store";

import type { Frequency } from "$lib/types";

export const frequencyStore = writable<Frequency>("Daily");
