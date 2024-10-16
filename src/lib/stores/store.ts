import { writable } from "svelte/store";
import { browser } from "$app/environment";

import type { Frequency } from "$lib/types";
import type { DateRange } from "bits-ui";

export const frequencyStore = writable<Frequency>("Daily");
export const selectedDateRange = writable<DateRange | null>(null);
export const selectedLists = writable<string[]>([]);



// Initialize the store with the value from localStorage if available
const storedCookies = browser ? localStorage.getItem("linkedInCookies") : null;
export const linkedInCookies = writable<string>(storedCookies || "");

// Subscribe to changes and update localStorage
if (browser) {
	linkedInCookies.subscribe((value) => {
		localStorage.setItem("linkedInCookies", value);
	});
}
