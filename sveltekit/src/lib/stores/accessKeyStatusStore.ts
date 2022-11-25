import { writable } from 'svelte/store';

export interface AccessKeyStatusStore {
	isEnabled: boolean;
	accessKey: string | undefined;
}

const accessKeyStatusStore = writable<AccessKeyStatusStore>({
	isEnabled: false,
	accessKey: undefined
});

export default accessKeyStatusStore;
