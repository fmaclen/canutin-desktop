import { getContext, setContext } from 'svelte';

import type { AccountsResponse, TypedPocketBase } from '$lib/pocketbase-types';
import { getPbClientContext } from '$lib/pocketbase.svelte';

class Accounts {
	accounts = $state<AccountsResponse[]>([]);
	private pbClient = getPbClientContext();

	private get pb(): TypedPocketBase {
		return this.pbClient.pb!;
	}

	constructor() {
		this.fetchAccounts();
		this.subscribeToAccountChanges();
	}

	private async fetchAccounts() {
		try {
			const records = await this.pb.collection('accounts').getFullList();
			this.accounts = records;
		} catch (error) {
			console.error('Error fetching accounts:', error);
		}
	}

	private subscribeToAccountChanges() {
		this.pb.collection('accounts').subscribe('*', (e) => {
			this.handleAccountChange(e.action, e.record);
		});
	}

	private handleAccountChange(action: string, record: AccountsResponse) {
		console.log('handleAccountChange', action, record.name);
		switch (action) {
			case 'create':
				this.accounts = [record, ...this.accounts];
				break;
			case 'update':
				this.accounts = this.accounts.map((a) => (a.id === record.id ? record : a));
				break;
			case 'delete':
				this.accounts = this.accounts.filter((a) => a.id !== record.id);
				break;
		}
	}

	dispose() {
		this.pb.collection('accounts').unsubscribe();
	}
}

export const CONTEXT_KEY_ACCOUNTS = 'accounts';

export function setAccountsContext() {
	return setContext(CONTEXT_KEY_ACCOUNTS, new Accounts());
}

export function getAccountsContext() {
	return getContext<ReturnType<typeof setAccountsContext>>(CONTEXT_KEY_ACCOUNTS);
}
