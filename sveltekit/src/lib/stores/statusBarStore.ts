import type { Apperance } from '$lib/helpers/constants';
import { writable } from 'svelte/store';

interface StatusBarStore {
	message: string;
	appearance: Apperance | null;
}

const statusBarStore = writable<StatusBarStore>({
	message: 'Canutin',
	appearance: null
});

export default statusBarStore;
