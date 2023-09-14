import { browser } from '$app/environment';
import { writable } from 'svelte/store';

// NOTE: There is code duplication here with the `lastUpdateCheckStore.ts`

const LOCAL_STORAGE_ITEM_NAME = 'colorTheme';

const localStoreItem = browser && window.localStorage.getItem(LOCAL_STORAGE_ITEM_NAME);
const colorThemeStore = writable(localStoreItem);

// Update the browser's local storage when the store changes
colorThemeStore.subscribe((value) => {
	if (browser && value) window.localStorage.setItem(LOCAL_STORAGE_ITEM_NAME, value.toString());
});

export default colorThemeStore;
