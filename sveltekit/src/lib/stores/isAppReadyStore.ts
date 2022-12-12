import { writable } from 'svelte/store';

const isAppReadyStore = writable(false);

export default isAppReadyStore;
