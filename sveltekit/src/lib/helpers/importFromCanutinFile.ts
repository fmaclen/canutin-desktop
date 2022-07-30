import { Prisma } from '@prisma/client';
import { fromUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prismaClient';

// import z from 'zod';

// const CanutinFile = z.object({
// 	accounts: z.array(
// 		z.object({
// 			name: z.string(),
// 			balanceGroup: z.number(),
// 			isAutoCalculated: z.boolean(),
// 			isClosed: z.boolean(),
// 			institution: z.string(),
// 			accountTypeName: z.string(),
// 			balanceStatements: z.array(
// 				z.object({
// 					createdAt: z.number(),
// 					value: z.number()
// 				})
// 			),
// 			transactions: z.array(
// 				z.object({
// 					createdAt: z.number(),
// 					description: z.string(),
// 					date: z.number(),
// 					value: z.number(),
// 					isExcluded: z.boolean(),
// 					isPending: z.boolean(),
// 					categoryName: z.string()
// 				})
// 			)
// 		})
// 	)
// });

interface CanutinFileAccountBalanceStatement {
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

interface CanutinFileAccount {
	name: string;
	balanceGroup: number;
	isAutoCalculated: boolean;
	isClosed: boolean;
	institution: string;
	accountTypeName: string;
	balanceStatements: CanutinFileAccountBalanceStatement[];
	transactions: CanutinFileTransaction[];
}

interface CanutinFileAssetBalanceStatement {
	createdAt: number;
	value: number;
	quantity?: number;
	cost?: number;
}

interface CanutinFileAsset {
	name: string;
	balanceGroup: number;
	isSold: boolean;
	symbol?: string;
	assetTypeName: string;
	balanceStatements: CanutinFileAssetBalanceStatement[];
}

interface CanutinFile {
	accounts: CanutinFileAccount[];
	assets: CanutinFileAsset[];
}

interface ImportedAccounts {
	created: number[];
	updated: number[];
	transactions: {
		created: number[];
		skipped: CanutinFileTransaction[];
	};
	balanceStatements: {
		created: number[];
		skipped: CanutinFileAccountBalanceStatement[];
	};
}

interface ImportedAssets {
	created: number[];
	updated: number[];
	balanceStatements: {
		created: number[];
		skipped: CanutinFileAssetBalanceStatement[];
	};
}

export interface ImportSummary {
	error?: string;
	importedAccounts?: ImportedAccounts;
	importedAssets?: ImportedAssets;
}

const importFromCanutinFile = async (canutinFile: CanutinFile) => {
	const importSessionDate = new Date();

	const importedAccounts: ImportedAccounts = {
		created: [],
		updated: [],
		transactions: { created: [], skipped: [] },
		balanceStatements: { created: [], skipped: [] }
	};

	const importedAssets: ImportedAssets = {
		created: [],
		updated: [],
		balanceStatements: { created: [], skipped: [] }
	};

	try {
		// Accounts
		for (const account of canutinFile.accounts) {
			let existingAccount = await prisma.account.findFirst({
				where: {
					name: {
						contains: account.name
					}
				}
			});

			// Create account if it doesn't exist
			if (!existingAccount) {
				existingAccount = await prisma.account.create({
					data: {
						name: account.name,
						balanceGroup: account.balanceGroup,
						isAutoCalculated: account.isAutoCalculated,
						isClosed: account.isClosed,
						institution: account.institution,
						accountTypeId: await getAccountTypeId(account.accountTypeName)
					}
				});
				importedAccounts.created.push(existingAccount.id);
			} else {
				importedAccounts.updated.push(existingAccount.id);
			}

			const { transactions, balanceStatements } = account;

			// Skip to the next account if there are no transactions or balance statements
			if (!transactions || !balanceStatements) continue;

			// Account balance statements
			for (const balanceStatement of balanceStatements) {
				try {
					const { id } = await prisma.accountBalanceStatement.create({
						data: {
							accountId: existingAccount.id,
							value: balanceStatement.value,
							createdAt: fromUnixTime(balanceStatement.createdAt)
						}
					});
					importedAccounts.balanceStatements.created.push(id);
				} catch (error) {
					if (error instanceof Prisma.PrismaClientKnownRequestError) {
						if (error.code === 'P2002') {
							importedAccounts.balanceStatements.skipped.push(balanceStatement);
							continue;
						}
					}
					throw error;
				}
			}

			// Transactions
			for (const transaction of transactions) {
				const transactionBlueprint = {
					createdAt: fromUnixTime(transaction.createdAt),
					description: transaction.description,
					date: fromUnixTime(transaction.date),
					value: transaction.value,
					isExcluded: transaction.isExcluded,
					isPending: transaction.isExcluded,
					accountId: existingAccount.id,
					categoryId: await getCategoryId(transaction.categoryName)
				};

				// Check if transaction is already in database
				const existingTransaction = await prisma.transaction.findFirst({
					where: {
						...transactionBlueprint
					}
				});

				// Skip duplicate transactions
				if (existingTransaction) {
					importedAccounts.transactions.skipped.push(transaction);
					continue;
				}

				// Create transaction
				const { id } = await prisma.transaction.create({
					data: {
						...transactionBlueprint,
						importedAt: importSessionDate
					}
				});
				importedAccounts.transactions.created.push(id);
			}
		}

		for (const assets of canutinFile.assets) {
			// do the same in accounts but for assets
		}

		return {
			importedAccounts,
			importedAssets
		};
	} catch (error) {
		return { error, importedAccounts, importedAssets };
	}
};

const getAccountTypeId = async (accountTypeName: string) => {
	const DEFAULT_ACCOUNT_TYPE = 'Other';
	let accountTypeId: { id: number } | null = null;

	const findAccountByName = async (name: string) => {
		return await prisma.accountType.findFirst({
			where: {
				name: {
					contains: name
				}
			},
			select: {
				id: true
			}
		});
	};

	accountTypeId = await findAccountByName(accountTypeName);

	if (!accountTypeId) {
		accountTypeId = await findAccountByName(DEFAULT_ACCOUNT_TYPE);

		if (!accountTypeId)
			throw new Error(
				`The default account type "${DEFAULT_ACCOUNT_TYPE}" was not found. Is the database is setup correctly?`
			);
	}

	return accountTypeId!.id;
};

const getCategoryId = async (categoryName: string) => {
	const DEFAULT_CATEGORY = 'Uncategorized';
	let transactionCategoryId: { id: number } | null = null;

	const findCategoryByName = async (name: string) => {
		return await prisma.transactionCategory.findFirst({
			where: {
				name: {
					contains: name
				}
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

export default importFromCanutinFile;

// Validate JSON schema
// Import Account:
// If already accounts exist add transactions and account balances
// Check if transaction is already in database (might need to add a `importedAt` date column)
// Check date of last account balance and only add newer balances
// If it doesn't exist create account and add transactions and account balances
