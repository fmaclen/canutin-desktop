import { getContext, setContext } from 'svelte';

import type { AssetsResponse, TypedPocketBase } from '$lib/pocketbase-types';
import { getPbClientContext } from '$lib/pocketbase.svelte';

class Assets {
	assets = $state<AssetsResponse[]>([]);
	private pbClient = getPbClientContext();

	private get pb(): TypedPocketBase {
		return this.pbClient.pb!;
	}

	constructor() {
		this.fetchAssets();
		this.subscribeToAssetChanges();
	}

	private async fetchAssets() {
		try {
			const records = await this.pb.collection('assets').getFullList();
			this.assets = records;
		} catch (error) {
			console.error('Error fetching assets:', error);
		}
	}

	private subscribeToAssetChanges() {
		this.pb.collection('assets').subscribe('*', (e) => {
			this.handleAssetChange(e.action, e.record);
		});
	}

	private handleAssetChange(action: string, record: AssetsResponse) {
		switch (action) {
			case 'create':
				this.assets = [record, ...this.assets];
				break;
			case 'update':
				this.assets = this.assets.map((a) => (a.id === record.id ? record : a));
				break;
			case 'delete':
				this.assets = this.assets.filter((a) => a.id !== record.id);
				break;
		}
	}

	dispose() {
		this.pb.collection('assets').unsubscribe();
	}
}

export const CONTEXT_KEY_ASSETS = 'assets';

export function setAssetsContext() {
	return setContext(CONTEXT_KEY_ASSETS, new Assets());
}

export function getAssetsContext() {
	return getContext<ReturnType<typeof setAssetsContext>>(CONTEXT_KEY_ASSETS);
}
