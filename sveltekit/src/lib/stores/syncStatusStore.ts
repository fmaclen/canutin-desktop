import { writable } from 'svelte/store';

export interface SyncStatusStore {
	isSyncSetup: boolean;
	isSyncEnabled: boolean;
}

const syncStatusStore = writable<SyncStatusStore>({
	isSyncSetup: false,
	isSyncEnabled: false
});

export default syncStatusStore;
