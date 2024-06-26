import { getUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prisma.server';
import type { Account, AccountType } from '@prisma/client';
import { getAccountCurrentBalance } from '$lib/helpers/models.server';

interface AccountSummary extends Account {
	lastUpdated: number;
	balance: number;
	transactionCount: number;
	accountType: AccountType;
}

export const load = async () => {
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

	const accountSummaries: AccountSummary[] = await Promise.all(
		accounts.map(async (account) => {
			const balance = await getAccountCurrentBalance(account);
			const transactionCount = account.transactions.length;

			const latestBalanceStatement =
				account.accountBalanceStatements[account.accountBalanceStatements.length - 1];

			const lastUpdated =
				account.isAutoCalculated || transactionCount === 0
					? getUnixTime(latestBalanceStatement?.createdAt || account.updatedAt)
					: getUnixTime(account.transactions[transactionCount - 1].date);

			return {
				...account,
				lastUpdated,
				balance,
				transactionCount
			};
		})
	);

	return { accounts: accountSummaries };
};
