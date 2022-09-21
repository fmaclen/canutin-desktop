import { Appearance } from '$lib/helpers/constants';
import { writable } from 'svelte/store';

interface StatusBarStore {
	message: string;
	appearance?: Appearance;
	isError?: boolean;
	secondaryActions?: { label: string; href: string; target?: string }[];
}

const statusBarStore = writable<StatusBarStore>({
	message: 'Canutin',
	isError: false
});

statusBarStore.subscribe((value) => {
	if (value.appearance === Appearance.NEGATIVE) value.isError = true;
});

export default statusBarStore;
