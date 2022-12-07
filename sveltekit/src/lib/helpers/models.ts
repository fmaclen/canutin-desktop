import prisma from '$lib/helpers/prisma.server';
import type { Account } from '@prisma/client';
import type { Asset } from '@prisma/client';
import { fromUnixTime } from 'date-fns';
import { SortOrder } from './constants';
import { dateInUTC } from './misc';

// Gets the Account or Asset type id from the name
export const getModelType = async (modelTypeName: string, isAccount: boolean) => {
	const DEFAULT_TYPE = 'Other';
	let modelTypeId: { id: number } | null = null;

	const findModel = async (name: string) => {
		const prismaQuery = {
			where: {
				name: {
					contains: name
				}
			},
			select: {
				id: true
			}
		};

		if (isAccount) {
			return await prisma.accountType.findFirst({ ...prismaQuery });
		} else {
			return await prisma.assetType.findFirst({ ...prismaQuery });
		}
	};

	modelTypeId = await findModel(modelTypeName);

	if (!modelTypeId) {
		modelTypeId = await findModel(DEFAULT_TYPE);

		if (!modelTypeId)
			throw new Error(
				`The default ${
					isAccount ? 'account' : 'asset'
				} type "${DEFAULT_TYPE}" was not found. Is the database is setup correctly?`
			);
	}

	return modelTypeId!.id;
};

export const getAccountCurrentBalance = async (account: Account, periodStart?: Date) => {
	if (account.isAutoCalculated) {
		// For auto-calculated accounts sum all of the transactions (except for excluded ones)
		const balanceFromTransactions = await prisma.transaction.aggregate({
			where: {
				accountId: account.id,
				isExcluded: false,
				date: {
					lte: periodStart
				}
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
				accountId: account.id,
				createdAt: {
					lte: periodStart
				}
			},
			orderBy: {
				createdAt: SortOrder.DESC
			}
		});

		return lastBalanceStatement?.value ? lastBalanceStatement.value : 0;
	}
};

export const getAssetCurrentBalance = async (asset: Asset, periodStart?: Date) => {
	const lastBalanceStatement = await prisma.assetBalanceStatement.findFirst({
		where: {
			assetId: asset.id,
			createdAt: {
				lte: periodStart
			}
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	return lastBalanceStatement?.value ? lastBalanceStatement.value : 0;
};

// Gets the Transaction category id from the name
export const getTransactionCategoryId = async (categoryName: string) => {
	const DEFAULT_CATEGORY = 'Uncategorized';
	let transactionCategoryId: { id: number } | null = null;

	const findCategoryByName = async (name: string) => {
		return await prisma.transactionCategory.findFirst({
			where: {
				name
			},
			select: {
				id: true
			}
		});
	};

	transactionCategoryId = await findCategoryByName(categoryName);

	if (!transactionCategoryId) {
		transactionCategoryId = await findCategoryByName(DEFAULT_CATEGORY);

		if (!transactionCategoryId)
			throw new Error(
				`The default transaction category "${DEFAULT_CATEGORY}" was not found. Is the database is setup correctly?`
			);
	}

	return transactionCategoryId!.id;
};

// Transaction descriptions are cleaned by removing extra spaces, tabs or new lines
export const formatTransactionDescription = (description: string) => {
	return description.replace(/\s\s+/g, ' ');
};

// Transaction dates are normalized to UTC at midnight
export const formatTransactionDate = (date: string | number | Date) => {
	switch (typeof date) {
		case 'string':
			return dateInUTC(fromUnixTime(Number(date)));
		case 'number':
			return dateInUTC(fromUnixTime(date));
		case 'object':
			return dateInUTC(date);
		default:
			throw new Error(`Invalid date type: ${typeof date}`);
	}
};
