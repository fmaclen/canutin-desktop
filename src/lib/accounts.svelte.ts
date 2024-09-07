import { ClientResponseError } from 'pocketbase';
import { getContext, setContext } from 'svelte';

import type {
	AccountsResponse,
	TransactionsResponse,
	TypedPocketBase
} from '$lib/pocketbase-types';
import { getPbClientContext } from '$lib/pocketbase.svelte';

class Accounts {
	accounts = $state<(AccountsResponse & { balance: number | null })[]>([]);
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
			const accountsCollection = await this.pb.collection('accounts').getFullList();
			const accountsWithBalance = await Promise.all(
				accountsCollection.map(async (account) => {
					try {
						const balance = await this.getAccountBalance(account);
						return { ...account, balance };
					} catch (error) {
						if (error instanceof ClientResponseError && error.isAbort) {
							console.log('Account balance fetch cancelled for:', account.name);
							return { ...account, balance: null };
						}
						throw error;
					}
				})
			);
			this.accounts = accountsWithBalance;
		} catch (error) {
			if (error instanceof ClientResponseError && error.isAbort) {
				console.log('Accounts fetch cancelled');
			} else {
				console.error('Error fetching accounts:', error);
			}
		}
	}

	private async getAccountBalance(account: AccountsResponse): Promise<number | null> {
		try {
			if (account.isAutoCalculated) {
				let transactions: TransactionsResponse[] = [];
				let page = 1;
				const perPage = 500;

				while (true) {
					const result = await this.pb
						.collection('transactions')
						.getList<TransactionsResponse>(page, perPage, {
							filter: `account="${account.id}"`,
							requestKey: `transactions_${account.id}_${page}` // Unique key for each page request
						});
					transactions = transactions.concat(result.items);
					if (page >= result.totalPages) break;
					page++;
				}

				return transactions.reduce((sum, transaction) => {
					const value = typeof transaction.value === 'number' ? transaction.value : 0;
					return sum + value;
				}, 0);
			} else {
				const latestStatement = await this.pb.collection('accountBalanceStatements').getList(1, 1, {
					filter: `account="${account.id}"`,
					sort: '-created',
					requestKey: null // Disable auto-cancellation for this request
				});
				return latestStatement.items[0]?.value ?? null;
			}
		} catch (error) {
			if (error instanceof ClientResponseError) {
				if (error.isAbort) {
					console.log('Balance fetch cancelled for account:', account.name);
				} else {
					console.error('Error fetching balance for account:', account.name, error);
				}
			} else {
				console.error('Unexpected error fetching balance for account:', account.name, error);
			}
			return null;
		}
	}

	private subscribeToAccountChanges() {
		this.pb.collection('accounts').subscribe('*', (e) => {
			this.handleAccountChange(e.action, e.record);
		});
		this.pb.collection('accountBalanceStatements').subscribe('*', (e) => {
			const account = this.accounts.find((a) => a.id === e.record.account);
			if (!account) throw new Error('Balance statement account not found');
			this.handleAccountChange('update', account);
		});
		this.pb.collection('transactions').subscribe('*', (e) => {
			const account = this.accounts.find((a) => a.id === e.record.account);
			if (!account) throw new Error('Transaction account not found');
			this.handleAccountChange('update', account);
		});
	}

	private async handleAccountChange(action: string, record: AccountsResponse) {
		const accountWithBalance = { ...record, balance: await this.getAccountBalance(record) };
		switch (action) {
			case 'create':
				this.accounts = [accountWithBalance, ...this.accounts];
				break;
			case 'update':
				this.accounts = this.accounts.map((a) => (a.id === record.id ? accountWithBalance : a));
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
