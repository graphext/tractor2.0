import { writable } from "svelte/store";

import type { Frequency } from "$lib/types";
import type { DateRange } from "bits-ui";

export const frequencyStore = writable<Frequency>("Daily");
export const selectedDateRange = writable<DateRange | null>(null);
export const selectedLists = writable<string[]>([]);
