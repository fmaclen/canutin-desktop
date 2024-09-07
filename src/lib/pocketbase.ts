import { randomUUID } from 'crypto';
import PocketBase from 'pocketbase';

import type { TypedPocketBase } from '$lib/pocketbase-types';
import type { AccountDetails } from '$lib/seed/demo/accounts';
import type { BalanceStatementDetails } from '$lib/seed/demo/balanceStatements';
import type { TransactionDetails } from '$lib/seed/demo/transactions';

export const POCKETBASE_DEFAULT_URL = 'http://127.0.0.1:8090';
export const POCKETBASE_SEED_ADMIN_EMAIL = 'admin@canutin.com';
export const POCKETBASE_SEED_DEFAULT_PASSWORD = '123qweasdzxc';

export const pb = new PocketBase(POCKETBASE_DEFAULT_URL) as TypedPocketBase;

export async function createVerifiedUniqueUser(baseName: string) {
	await pb.admins.authWithPassword(POCKETBASE_SEED_ADMIN_EMAIL, POCKETBASE_SEED_DEFAULT_PASSWORD);
	const shortUUID = randomUUID().split('-')[0];
	const email = `${baseName}.${shortUUID}@canutin.com`;
	const user = await pb.collection('users').create({
		email,
		password: POCKETBASE_SEED_DEFAULT_PASSWORD,
		passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD,
		name: `${baseName.slice(0, 1).toUpperCase() + baseName.slice(1)} ${shortUUID}`
	});
	await pb.collection('users').update(user.id, { verified: true });
	return user;
}

export async function getTagId(name: string, type: string) {
	try {
		const result = await pb
			.collection('tags')
			.getFirstListItem(`name ~ "${name}" && for = "${type}"`);
		return result.id;
	} catch (error) {
		return null;
	}
}

export async function createAccount(ownerId: string, account: AccountDetails) {
	const tagId = await getTagId(account.tag, 'accounts');
	return await pb.collection('accounts').create({
		...account,
		tag: tagId,
		owner: ownerId
	});
}

export async function createTransactions(accountId: string, transactions: TransactionDetails[]) {
	for (const transaction of transactions) {
		const tagId = await getTagId(transaction.tag, 'transactions');
		await pb.collection('transactions').create({
			...transaction,
			account: accountId,
			tag: tagId
		});
	}
}

export async function createAccountBalanceStatements(
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
