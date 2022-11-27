import { writable } from 'svelte/store';

export interface AccessKeyStatusStore {
	accessKey: string | undefined;
}

const accessKeyStatusStore = writable<AccessKeyStatusStore>({
	accessKey: undefined
});

export default accessKeyStatusStore;
