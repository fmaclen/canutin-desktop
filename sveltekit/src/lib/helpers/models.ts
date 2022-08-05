import prisma from '$lib/helpers/prismaClient';
import type { Account } from '@prisma/client';
import type { Asset } from '@prisma/client';
import { SortOrder } from './constants';

export const getAccountCurrentBalance = async (account: Account) => {
	if (account.isAutoCalculated) {
		// For auto-calculated accounts sum all of the transactions
		const balanceFromTransactions = await prisma.transaction.aggregate({
			where: {
				accountId: account.id,
				isExcluded: false
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

export const getAssetCurrentBalance = async (asset: Asset) => {
	const lastBalanceStatement = await prisma.assetBalanceStatement.findFirst({
		where: {
			assetId: asset.id
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	return lastBalanceStatement?.value ? lastBalanceStatement.value : 0;
};

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
