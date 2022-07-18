import { fromUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prismaClient';

// FIXME:
// This is meant to be a temporary implementation until we have a UI that can import CanutinFiles.
// Remove `/tmp` path from `.gitignore` as well.
import canutinFile from '$lib/tmp/canutin_file_v2.json';

interface CanutinFileBalanceStatement {
	createdAt: number;
	value: number;
}

interface CanutinFileTransaction {
	createdAt: number;
	description: string;
	date: number;
	value: number;
	isExcluded: boolean;
	isPending: boolean;
	categoryName: string;
}

const importFromCanutinFile = async () => {
	const formatBalanceStatements = (balanceStatements: CanutinFileBalanceStatement[]) => {
		if (!balanceStatements) return [];

		return balanceStatements.map((accountBalanceStatement) => {
			return {
				...accountBalanceStatement,
				createdAt: fromUnixTime(accountBalanceStatement.createdAt)
			};
		});
	};

	// Import accounts
	for (const account of canutinFile.accounts) {
		const {
			balanceGroup,
			name,
			institution,
			isAutoCalculated,
			isClosed,
			balanceStatements,
			transactions,
			accountTypeName
		} = account;

		const getAccountTypeId = async (accountTypeName: string) => {
			const accountType = await prisma.accountType.findFirst({
				where: {
					name: {
						contains: accountTypeName
					}
				},
				select: {
					id: true
				}
			});

			return accountType?.id;
		};

		const getCategoryId = async (categoryName: string) => {
			if (categoryName === 'Imported') {
				categoryName = 'Uncategorized';
			}

			const transactionCategory = await prisma.transactionCategory.findFirst({
				where: {
					name: {
						contains: categoryName
					}
				},
				select: {
					id: true
				}
			});

			return transactionCategory?.id;
		};

		const formatTransactions = async (transactions: CanutinFileTransaction[]) => {
			if (!transactions) return [];

			return Promise.all(
				transactions.map(async (transaction) => {
					return {
						createdAt: fromUnixTime(transaction.createdAt),
						description: transaction.description,
						date: fromUnixTime(transaction.date),
						value: transaction.value,
						isExcluded: transaction.isExcluded,
						isPending: transaction.isExcluded,
						categoryId: await getCategoryId(transaction.categoryName)
					};
				})
			);
		};

		let createAccount: any = {
			balanceGroup,
			name,
			institution,
			isAutoCalculated,
			isClosed,
			accountTypeId: await getAccountTypeId(accountTypeName)
		};

		if (balanceStatements) {
			createAccount = {
				...createAccount,
				accountBalanceStatements: {
					create: formatBalanceStatements(balanceStatements as CanutinFileBalanceStatement[])
				}
			};
		}

		if (transactions) {
			createAccount = {
				...createAccount,
				transactions: {
					create: await formatTransactions(transactions as CanutinFileTransaction[])
				}
			};
		}

		await prisma.account.upsert({
			where: { name },
			update: {},
			create: createAccount
		});
	}

	// Import assets
	for (const asset of canutinFile.assets) {
		const { balanceGroup, name, isSold, balanceStatements, assetTypeName } = asset;

		const getAssetTypeId = async (assetTypeName: string) => {
			const assetType = await prisma.assetType.findFirst({
				where: {
					name: {
						contains: assetTypeName
					}
				},
				select: {
					id: true
				}
			});

			return assetType?.id;
		};

		let createAsset: any = {
			balanceGroup,
			name,
			isSold,
			assetTypeId: await getAssetTypeId(assetTypeName)
		};

		if (balanceStatements) {
			createAsset = {
				...createAsset,
				assetBalanceStatements: {
					create: formatBalanceStatements(balanceStatements as CanutinFileBalanceStatement[])
				}
			};
		}

		await prisma.asset.upsert({
			where: { name },
			update: {},
			create: createAsset
		});
	}

	return true;
};

export default importFromCanutinFile;
