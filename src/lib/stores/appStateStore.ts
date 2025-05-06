import { writable } from 'svelte/store';

export type AppState = 'idle' | 'success' | 'running' | 'error';
export const appState = writable<AppState>('idle');

