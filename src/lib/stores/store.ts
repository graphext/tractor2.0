
import { persisted } from "svelte-persisted-store"


import type { Frequency } from "$lib/types";
import type { DateRange } from "bits-ui";

export const frequencyStore = persisted<Frequency>("frequencyStore", "Daily");
export const selectedDateRange = persisted<DateRange | null>("selectedDateRange", null);
export const selectedLists = persisted<string[]>("selectedLists", []);
export const linkedInCookies = persisted<string>("linkedInCookies", "");
