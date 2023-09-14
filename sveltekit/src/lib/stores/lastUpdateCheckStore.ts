import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// NOTE: There is code duplication here with the `colorThemeStore.ts`

const LOCAL_STORAGE_ITEM_NAME = 'lastUpdateCheck';

const localStoreItem = browser && window.localStorage.getItem(LOCAL_STORAGE_ITEM_NAME);
const lastUpdateCheckStore = writable(localStoreItem && parseInt(localStoreItem));

// Update the browser's local storage when the store changes
lastUpdateCheckStore.subscribe((value) => {
	if (browser && value) window.localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, value.toString());
});

export default lastUpdateCheckStore;
