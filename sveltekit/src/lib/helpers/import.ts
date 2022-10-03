import { fromUnixTime } from 'date-fns';
import { Prisma } from '@prisma/client';

import prisma from '$lib/helpers/prisma';
import { getModelType, getTransactionCategoryId } from '$lib/helpers/models';
import { SyncSettings } from './constants';

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

export interface ImportSync {
	canutinFileUrl: string;
	frequency: number;
	cookie?: string;
	jwt?: string;
}

export const importFromCanutinFile = async (canutinFile: CanutinFile) => {
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
		if (canutinFile.accounts) {
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
				if (!account.transactions && !account.balanceStatements) continue;

				// Account balance statements
				if (account.balanceStatements) {
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
				}

				// Transactions
				if (account.transactions) {
					for (const transaction of account.transactions) {
						const transactionBlueprint = {
							createdAt: fromUnixTime(transaction.createdAt),
							description: transaction.description,
							date: fromUnixTime(transaction.date),
							value: transaction.value,
							isExcluded: transaction.isExcluded,
							isPending: transaction.isExcluded,
							accountId: existingAccount.id,
							categoryId: await getTransactionCategoryId(transaction.categoryName)
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
			}
		}

		// Assets
		if (canutinFile.assets) {
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

				// Skip to the next asset if there are no balance statements
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
		}

		return {
			importedAccounts,
			importedAssets
		};
	} catch (error: any) {
		let errorMessage;

		if (error instanceof Prisma.PrismaClientValidationError) {
			errorMessage = 'The CanutinFile provided is invalid';
		} else {
			errorMessage = error.message;
		}

		return { error: errorMessage, importedAccounts, importedAssets };
	}
};

export const getIsSyncEnabled = async () => {
	const syncEnabled = await prisma.setting.findFirst({
		where: { name: SyncSettings.SYNC_ENABLED }
	});
	return syncEnabled?.value === '1' ? true : false;
};
