// FIXME: this should be moved to a `load()` function in `accounts/+page.server.ts`

import { json } from '@sveltejs/kit';
import { getUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prisma';
import type { Account, AccountType } from '@prisma/client';
import { getAccountCurrentBalance } from '$lib/helpers/models';

export interface AccountResponse extends Account {
	lastUpdated: number;
	balance: number;
	transactionCount: number;
	accountType: AccountType;
}

export const GET = async () => {
	const accounts = await prisma.account.findMany({
		include: {
			accountBalanceStatements: true,
			accountType: true,
			transactions: true
		},
		orderBy: {
			name: 'asc'
		}
	});

	const accountsResponse: Promise<AccountResponse[]> = Promise.all(
		accounts.map(async (account) => {
			const latestBalanceStatement =
				account.accountBalanceStatements[account.accountBalanceStatements.length - 1];
			const balance = await getAccountCurrentBalance(account);
			const transactionCount = account.transactions.length;
			const lastUpdated =
				account.isAutoCalculated || transactionCount === 0
					? getUnixTime(latestBalanceStatement.createdAt)
					: getUnixTime(account.transactions[transactionCount - 1].date);

			return {
				...account,
				lastUpdated,
				balance,
				transactionCount
			};
		})
	);

	return json(await accountsResponse);
};
