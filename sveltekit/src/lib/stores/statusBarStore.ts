import type { Appearance } from '$lib/helpers/constants';
import { writable } from 'svelte/store';

interface StatusBarStore {
	message: string;
	appearance: Appearance | null;
	isDismissable?: boolean;
}

const statusBarStore = writable<StatusBarStore>({
	message: 'Canutin',
	appearance: null,
	isDismissable: true
});

export default statusBarStore;
