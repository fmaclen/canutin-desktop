import { fromUnixTime } from 'date-fns';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prismaClient';

export const POST = async ({ request }: RequestEvent) => {
	const canutinFile = await request.json();
	const importResult = await importFromCanutinFile(canutinFile);

	return {
		status: 200,
		body: importResult
	};
};

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
						accountTypeId: await getModelType(account.accountTypeName, true)
					}
				});
				importedAccounts.created.push(existingAccount.id);
			} else {
				importedAccounts.updated.push(existingAccount.id);
			}

			// Skip to the next account if there are no transactions or balance statements
			if (!account.transactions || !account.balanceStatements) continue;

			// Account balance statements
			for (const balanceStatement of account.balanceStatements) {
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
			for (const transaction of account.transactions) {
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

		// Assets
		for (const asset of canutinFile.assets) {
			let existingAsset = await prisma.asset.findFirst({
				where: {
					name: {
						contains: asset.name
					}
				}
			});

			// Create asset if it doesn't exist
			if (!existingAsset) {
				existingAsset = await prisma.asset.create({
					data: {
						name: asset.name,
						balanceGroup: asset.balanceGroup,
						isSold: asset.isSold,
						symbol: asset.symbol,
						assetTypeId: await getModelType(asset.assetTypeName, false)
					}
				});
				importedAssets.created.push(existingAsset.id);
			} else {
				importedAssets.updated.push(existingAsset.id);
			}

			// Skip to the next asset if there are no transactions or balance statements
			if (!asset.balanceStatements) continue;

			// Asset balance statements
			for (const balanceStatement of asset.balanceStatements) {
				try {
					const { id } = await prisma.assetBalanceStatement.create({
						data: {
							assetId: existingAsset.id,
							value: balanceStatement.value,
							quantity: balanceStatement.quantity,
							cost: balanceStatement.cost,
							createdAt: fromUnixTime(balanceStatement.createdAt)
						}
					});
					importedAssets.balanceStatements.created.push(id);
				} catch (error) {
					if (error instanceof Prisma.PrismaClientKnownRequestError) {
						if (error.code === 'P2002') {
							importedAssets.balanceStatements.skipped.push(balanceStatement);
							continue;
						}
					}
					throw error;
				}
			}
		}

		return {
			importedAccounts,
			importedAssets
		};
	} catch (error: any) {
		return { error: error.message, importedAccounts, importedAssets };
	}
};

const getModelType = async (modelTypeName: string, isAccount: boolean) => {
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
