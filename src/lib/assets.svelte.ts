import { ClientResponseError } from 'pocketbase';
import { getContext, setContext } from 'svelte';

import type { AssetsResponse, TypedPocketBase } from '$lib/pocketbase-types';
import { getPbClientContext } from '$lib/pocketbase.svelte';

class Assets {
	assets = $state<(AssetsResponse & { balance: number | null })[]>([]);
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
			const assetsCollection = await this.pb.collection('assets').getFullList();
			const assetsWithBalance = await Promise.all(
				assetsCollection.map(async (asset) => {
					try {
						const balance = await this.getAssetBalance(asset);
						return { ...asset, balance };
					} catch (error) {
						if (error instanceof ClientResponseError && error.isAbort) {
							console.log('Asset balance fetch cancelled for:', asset.name);
							return { ...asset, balance: null };
						}
						throw error;
					}
				})
			);
			this.assets = assetsWithBalance;
		} catch (error) {
			if (error instanceof ClientResponseError && error.isAbort) {
				console.log('Assets fetch cancelled');
			} else {
				console.error('Error fetching assets:', error);
			}
		}
	}

	private async getAssetBalance(asset: AssetsResponse): Promise<number | null> {
		try {
			const latestStatement = await this.pb.collection('assetBalanceStatements').getList(1, 1, {
				filter: `asset="${asset.id}"`,
				sort: '-created',
				requestKey: null // Disable auto-cancellation for this request
			});
			return latestStatement.items[0]?.value ?? null;
		} catch (error) {
			if (error instanceof ClientResponseError) {
				if (error.isAbort) {
					console.log('Balance fetch cancelled for asset:', asset.name);
				} else {
					console.error('Error fetching balance for asset:', asset.name, error);
				}
			} else {
				console.error('Unexpected error fetching balance for asset:', asset.name, error);
			}
			return null;
		}
	}

	private subscribeToAssetChanges() {
		this.pb.collection('assets').subscribe('*', (e) => {
			this.handleAssetChange(e.action, e.record);
		});
	}

	private async handleAssetChange(action: string, record: AssetsResponse) {
		const assetWithBalance = { ...record, balance: await this.getAssetBalance(record) };
		switch (action) {
			case 'create':
				this.assets = [assetWithBalance, ...this.assets];
				break;
			case 'update':
				this.assets = this.assets.map((a) => (a.id === record.id ? assetWithBalance : a));
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
