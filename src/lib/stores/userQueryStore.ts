import { writable } from "svelte/store";
import { browser } from "$app/environment";

// Initialize the store with the value from localStorage if available
const storedQuery = browser ? localStorage.getItem("userQuery") : null;
const storedApifyTerms = browser ? localStorage.getItem("apifyTerms") : null;
export const userQuery = writable<string>(storedQuery || "");
export const apifyTerms = writable<string>(storedApifyTerms || "");

// Subscribe to changes and update localStorage
if (browser) {
	userQuery.subscribe((value) => {
		localStorage.setItem("userQuery", value);
	});

	apifyTerms.subscribe((value) => {
		localStorage.setItem("apifyTerms", value);
	});
}
