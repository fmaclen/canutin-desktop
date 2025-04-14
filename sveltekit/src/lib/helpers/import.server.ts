import { fromUnixTime } from 'date-fns';
import { Prisma, type Setting } from '@prisma/client';

import prisma from '$lib/helpers/prisma.server';
import {
	formatTransactionDescription,
	formatTransactionDate,
	getModelType,
	getTransactionCategoryId
} from '$lib/helpers/models.server';
import { SyncSettings } from './constants';
import type { SyncStatusStore } from '$lib/stores/syncStatusStore';
import type { CanutinFile, ImportedAccounts, ImportedAssets } from './import';
import { env } from '$env/dynamic/private';
import { dateInUTC } from './timezone';

export const importFromCanutinFile = async (canutinFile: CanutinFile) => {
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

				// Transactions + TransactionImports (a.k.a. history of imported transactions)
				if (account.transactions) {
					for (const transaction of account.transactions) {
						const transactionImportBlueprint = {
							description: formatTransactionDescription(transaction.description),
							date: formatTransactionDate(transaction.date),
							value: transaction.value,
							isExcluded: transaction.isExcluded,
							isPending: transaction.isPending,
							accountId: existingAccount.id
						};

						// Check if a TransactionImport already exists
						const existingTransactionImport = await prisma.transactionImport.findFirst({
							where: {
								accountId: transactionImportBlueprint.accountId,
								description: transactionImportBlueprint.description,
								date: {
									gte: new Date(
										Date.UTC(
											transactionImportBlueprint.date.getUTCFullYear(),
											transactionImportBlueprint.date.getUTCMonth(),
											transactionImportBlueprint.date.getUTCDate(),
											0,
											0,
											0,
											0
										)
									),
									lt: new Date(
										Date.UTC(
											transactionImportBlueprint.date.getUTCFullYear(),
											transactionImportBlueprint.date.getUTCMonth(),
											transactionImportBlueprint.date.getUTCDate() + 1,
											0,
											0,
											0,
											0
										)
									)
								},
								value: transactionImportBlueprint.value
							}
						});

						// Skip duplicate TransactionImports
						if (existingTransactionImport) {
							importedAccounts.transactions.skipped.push(transaction);
							continue;
						}

						// Minimize duplicate Transactions by matching key values against existing transactions
						const existingTransaction = await prisma.transaction.findFirst({
							where: {
								accountId: transactionImportBlueprint.accountId,
								description: transactionImportBlueprint.description,
								date: {
									gte: new Date(
										Date.UTC(
											transactionImportBlueprint.date.getUTCFullYear(),
											transactionImportBlueprint.date.getUTCMonth(),
											transactionImportBlueprint.date.getUTCDate(),
											0,
											0,
											0,
											0
										)
									),
									lt: new Date(
										Date.UTC(
											transactionImportBlueprint.date.getUTCFullYear(),
											transactionImportBlueprint.date.getUTCMonth(),
											transactionImportBlueprint.date.getUTCDate() + 1,
											0,
											0,
											0,
											0
										)
									)
								},
								value: transactionImportBlueprint.value
							}
						});
						if (existingTransaction) {
							importedAccounts.transactions.skipped.push(transaction);
							continue;
						}

						// Create Transaction
						const { id } = await prisma.transaction.create({
							data: {
								...transactionImportBlueprint,
								categoryId: await getTransactionCategoryId(transaction.categoryName)
							}
						});

						// Create TransactionImport
						const transactionImport = await prisma.transactionImport.create({
							data: {
								...transactionImportBlueprint,
								date: dateInUTC(transactionImportBlueprint.date),
								transactionId: id,
								categoryName: transaction.categoryName
							}
						});

						importedAccounts.transactions.created.push(transactionImport.transactionId);
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

export const getSyncStatus = async (): Promise<SyncStatusStore> => {
	let syncEnabled: Setting | null = null;

	try {
		syncEnabled = await prisma.setting.findFirst({
			where: { name: SyncSettings.SYNC_ENABLED }
		});
	} catch (error) {
		if (env.SHOULD_CHECK_VAULT === 'true')
			console.error(
				"\n\n-> Couldn't get sync status, likely because `SHOULD_CHECK_VAULT=true` and vault is not ready yet\n\n"
			);
		console.error(error);
	}

	return {
		isSyncSetup: syncEnabled !== null ? true : false,
		isSyncEnabled: syncEnabled?.value === '1' ? true : false
	};
};
