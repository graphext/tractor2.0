import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Initialize the store with the value from localStorage if available
const storedKey = browser ? localStorage.getItem("apifyKey") : null;
export const apifyKey = writable<string>(storedKey || "");


// Subscribe to changes and update localStorage
if (browser) {
	apifyKey.subscribe((value) => {
		localStorage.setItem("apifyKey", value);
	});
}
