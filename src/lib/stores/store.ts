import { writable } from "svelte/store";
import { browser } from "$app/environment";

import type { Frequency } from "$lib/types";

export const frequencyStore = writable<Frequency>("Daily");
