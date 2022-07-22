import prisma from '$lib/helpers/prismaClient';
import type { Account } from '@prisma/client';
import { SortOrder } from './constants';

export const getAccountCurrentBalance = async (account: Account) => {
	if (account.isAutoCalculated) {
		// For auto-calculated accounts sum all of the transactions
		const balanceFromTransactions = await prisma.transaction.aggregate({
			where: {
				accountId: account.id
			},
			_sum: {
				value: true
			}
		});

		return balanceFromTransactions._sum.value || 0;
	} else {
		// For non-auto-calculated accounts get the most recent balance statement
		const lastBalanceStatement = await prisma.accountBalanceStatement.findFirst({
			where: {
				accountId: account.id
			},
			orderBy: {
				createdAt: SortOrder.DESC
			}
		});

		return lastBalanceStatement?.value ? lastBalanceStatement.value : 0;
	}
};
