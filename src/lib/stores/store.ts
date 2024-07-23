import { writable } from "svelte/store";
import { browser } from "$app/environment";

import type { Frequency } from "$lib/types";

const storedFrequency = browser
	? (localStorage.getItem("frequencyStore") as Frequency)
	: null;
export const frequencyStore = writable<Frequency>(storedFrequency || "Daily");

if (browser) {
	frequencyStore.subscribe((value) => {
		localStorage.setItem("frequencyStore", value);
	});
}
