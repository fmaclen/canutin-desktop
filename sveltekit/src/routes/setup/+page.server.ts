import { runPrismaMigrate, runPrismaSeed } from '$lib/helpers/prismaClient';
import { redirect } from '@sveltejs/kit';
import { Prisma, PrismaClient } from '@prisma/client';

export const load = async () => {
	let prisma: PrismaClient;

	// Apply vault migrations
	const vaultIsMigrated = async () => {
		await runPrismaMigrate();

		// Check all the tables are migrated correctly
		try {
			prisma = new PrismaClient();

			// Get all the models in the schema
			const models = Prisma.dmmf.datamodel.models.map(
				(model) => model.name.charAt(0).toLowerCase() + model.name.slice(1) // Covert model names to camelCase
			);

			// Query each of the models to check if they exist in the vault
			for (const model of models) {
				await prisma[`${model}`].count();
			}
		} catch (error) {
			console.log(error);
			return false;
		}
		return true;
	};

	// Can't continue if the vault is not migrated, something went wrong
	const isMigrated = await vaultIsMigrated();
	if (!isMigrated) return { isReady: false };

	// Check the vault has been seeded with at least one record for these models
	const vaultIsSeeded = async () => {
		prisma = new PrismaClient();
		const accountTypeCount = await prisma.accountType.count();
		const assetTypeCount = await prisma.assetType.count();
		const transactionCategoryCount = await prisma.transactionCategory.count();
		const transactionCategoryGroupCount = await prisma.transactionCategoryGroup.count();

		const isSeeded = ![
			accountTypeCount,
			assetTypeCount,
			transactionCategoryCount,
			transactionCategoryGroupCount
		].includes(0);

		if (!isSeeded) {
			try {
				await runPrismaSeed();
				vaultIsSeeded();
			} catch {
				return false;
			}
		}
		return true;
	};

	// Can't continue if the vault is not migrated, something went wrong
	const isSeeded = await vaultIsSeeded();
	if (!isSeeded) return { isReady: false };

	if (isMigrated && isSeeded) {
		throw redirect(307, '/');
	} else {
		return {
			isReady: true
		};
	}
};
