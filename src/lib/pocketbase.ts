import PocketBase from 'pocketbase';

import type { TypedPocketBase } from '$lib/pocketbase-types';
import type { AccountDetails } from '$lib/seed/data/accounts';
import type { BalanceStatementDetails } from '$lib/seed/data/balanceStatements';
import type { TransactionDetails } from '$lib/seed/data/transactions';

import type { AssetDetails } from './seed/data/assets';

export const POCKETBASE_DEFAULT_URL = 'http://127.0.0.1:8090';
export const POCKETBASE_SEED_ADMIN_EMAIL = 'admin@canutin.com';
export const POCKETBASE_SEED_DEFAULT_PASSWORD = '123qweasdzxc';

export const pbAdmin = new PocketBase(POCKETBASE_DEFAULT_URL) as TypedPocketBase;

export async function getTagId(pb: TypedPocketBase, name: string, type: string) {
	const result = await pb
		.collection('tags')
		.getFirstListItem(`name ~ "${name}" && for = "${type}"`);
	return result.id;
}

export async function createAccount(pb: TypedPocketBase, account: AccountDetails) {
	const tagId = await getTagId(pb, account.tag, 'accounts');
	return await pb.collection('accounts').create({
		...account,
		tag: tagId,
		owner: pb.authStore.model?.id
	});
}

export async function createTransactions(
	pb: TypedPocketBase,
	accountId: string,
	transactions: TransactionDetails[]
) {
	for (const transaction of transactions) {
		const tagId = await getTagId(pb, transaction.tag, 'transactions');
		await pb.collection('transactions').create({
			...transaction,
			account: accountId,
			tag: tagId
		});
	}
}

export async function createAccountBalanceStatements(
	pb: TypedPocketBase,
	accountId: string,
	balanceStatements: BalanceStatementDetails[]
) {
	for (const balanceStatement of balanceStatements) {
		await pb.collection('accountBalanceStatements').create({
			account: accountId,
			...balanceStatement
		});
	}
}

export async function createAssetBalanceStatements(
	pb: TypedPocketBase,
	assetId: string,
	balanceStatements: BalanceStatementDetails[]
) {
	for (const balanceStatement of balanceStatements) {
		await pb.collection('assetBalanceStatements').create({
			asset: assetId,
			...balanceStatement
		});
	}
}

export async function createAsset(pb: TypedPocketBase, asset: AssetDetails) {
	const tagId = await getTagId(pb, asset.tag, 'assets');
	return await pb.collection('assets').create({
		...asset,
		tag: tagId,
		owner: pb.authStore.model?.id
	});
}
