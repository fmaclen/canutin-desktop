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
	let result: Date;
	switch (typeof date) {
		case 'string':
		case 'number':
			// For Unix timestamps, create the date directly in UTC
			const timestamp = typeof date === 'string' ? Number(date) : date;
			result = new Date(timestamp * 1000);
			break;
		case 'object':
			result = dateInUTC(date);
			break;
		default:
			throw new Error(`Invalid date type: ${typeof date}`);
	}
	return result;
};

// Returns dates for the Account's oldest balance and the newest balance
export const getAccountBalanceDateRange = async (account: Account) => {
	let periodStart: Date | undefined;
	let periodEnd: Date | undefined;
	const queryByAccount = { where: { accountId: account.id } };

	if (account.isAutoCalculated) {
		// When the account is auto-calculated, the balance history is based on the earliest and most recent transaction date
		const earliestQuery = { ...queryByAccount, orderBy: { date: SortOrder.ASC } };
		const latestQuery = { ...queryByAccount, orderBy: { date: SortOrder.DESC } };
		periodStart = await prisma.transaction.findFirst(earliestQuery).then((t) => t?.date);
		periodEnd = await prisma.transaction.findFirst(latestQuery).then((t) => t?.date);
	} else {
		// When the account is NOT auto-calculated, the balance history is based on the earliest and most recent balance statement
		const earliestQuery = { ...queryByAccount, orderBy: { createdAt: SortOrder.ASC } };
		const latestQuery = { ...queryByAccount, orderBy: { createdAt: SortOrder.DESC } };
		periodStart = await prisma.accountBalanceStatement.findFirst(earliestQuery).then((abs) => abs?.createdAt); // prettier-ignore
		periodEnd = await prisma.accountBalanceStatement.findFirst(latestQuery).then((abs) => abs?.createdAt); // prettier-ignore
	}

	return {
		periodStart,
		periodEnd
	};
};

// Returns dates for the Asset's oldest balance and the newest balance
export const getAssetBalanceDateRange = async (asset: Asset) => {
	const queryByAsset = { where: { assetId: asset.id } };
	const earliestQuery = { ...queryByAsset, orderBy: { createdAt: SortOrder.ASC } };
	const latestQuery = { ...queryByAsset, orderBy: { createdAt: SortOrder.DESC } };
	const periodStart = await prisma.assetBalanceStatement.findFirst(earliestQuery).then((abs) => abs?.createdAt); // prettier-ignore
	const periodEnd = await prisma.assetBalanceStatement.findFirst(latestQuery).then((abs) => abs?.createdAt); // prettier-ignore

	return {
		periodStart,
		periodEnd
	};
};
