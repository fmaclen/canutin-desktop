import type { Appearance } from '$lib/helpers/constants';
import { writable } from 'svelte/store';

interface StatusBarStore {
	message: string;
	appearance: Appearance | null;
}

const statusBarStore = writable<StatusBarStore>({
	message: 'Canutin',
	appearance: null
});

export default statusBarStore;
