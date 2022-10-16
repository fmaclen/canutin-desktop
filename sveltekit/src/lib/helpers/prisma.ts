import path from 'path';
import { fork } from 'child_process';
import { env } from '$env/dynamic/private';
import { Prisma, PrismaClient, type Account, type Asset, type Transaction } from '@prisma/client';
import { json } from '@sveltejs/kit';

const cwd = env.SVELTEKIT_PATH ? env.SVELTEKIT_PATH : process.cwd();

const platformToExecutables: any = {
	win32: {
		migrationEngine: '@prisma/engines/migration-engine-windows.exe',
		queryEngine: '.prisma/client/query_engine-windows.dll.node'
	},
	linux: {
		migrationEngine: '@prisma/engines/migration-engine-debian-openssl-1.1.x',
		queryEngine: '.prisma/client/libquery_engine-debian-openssl-1.1.x.so.node'
	},
	darwin: {
		migrationEngine: '@prisma/engines/migration-engine-darwin',
		queryEngine: '.prisma/client/libquery_engine-darwin.dylib.node'
	},
	darwinArm64: {
		migrationEngine: '@prisma/engines/migration-engine-darwin-arm64',
		queryEngine: '.prisma/client/libquery_engine-darwin-arm64.dylib.node'
	}
};

const getPlatformName = () => {
	const isDarwin = process.platform === 'darwin';
	if (isDarwin && process.arch === 'arm64') {
		return process.platform + 'Arm64';
	}

	return process.platform;
};

const platformName = getPlatformName();
const nodeModulesPath = path.join(cwd, 'node_modules');
const queryEnginePath = path.join(nodeModulesPath, platformToExecutables[platformName].queryEngine);

const runPrismaMigrate = async (): Promise<number> => {
	const migrationEnginePath = path.join(
		nodeModulesPath,
		platformToExecutables[platformName].migrationEngine
	);

	const prismaExecModule = path.join(nodeModulesPath, 'prisma', 'build', 'index.js');

	try {
		const exitCode = await new Promise((resolve, _) => {
			const child = fork(prismaExecModule, ['migrate', 'deploy'], {
				cwd,
				env: {
					...env,
					PRISMA_MIGRATION_ENGINE_BINARY: migrationEnginePath,
					PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath
				},
				stdio: 'inherit'
			});

			child.on('close', (code) => {
				resolve(code);
			});
		});

		if (exitCode !== 0) throw Error(`command failed with exit code ${exitCode}`);

		return exitCode;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const getPrismaModelNames = () => {
	return Prisma.dmmf.datamodel.models.map(
		(model) =>
			(model.name.charAt(0).toLowerCase() + model.name.slice(1)) as Uncapitalize<Prisma.ModelName>
	);
};

export const validateVaultMigration = async () => {
	await runPrismaMigrate();

	// PrismaClient seems to cache results so we need to instantiate a new client
	const uncachedPrisma = new PrismaClient();

	// Check all the tables are migrated correctly
	try {
		// Get all the model names in the schema in 'camelCase'
		const models = getPrismaModelNames();

		// Query each of the models to check if they exist in the vault
		for (const model of models) {
			// REF: https://github.com/prisma/prisma/issues/5273
			// @ts-expect-error "This expression is not callable"
			await uncachedPrisma[model].count();
		}
		uncachedPrisma.$disconnect();
	} catch (error) {
		uncachedPrisma.$disconnect();
		console.error(error);
		return false;
	}
	return true;
};

const runPrismaSeed = async (): Promise<number> => {
	const seedModulePath = path.join(cwd, 'prisma', 'seed.js');

	try {
		const exitCode = await new Promise((resolve, _) => {
			const child = fork(seedModulePath, { stdio: 'inherit' });

			child.on('close', (code) => {
				resolve(code);
			});
		});

		if (exitCode !== 0) throw Error(`command failed with exit code ${exitCode}`);

		return exitCode;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

export const validateVaultSeed = async (ranTwice = false) => {
	const uncachedPrisma = new PrismaClient();
	const accountTypeCount = await uncachedPrisma.accountType.count();
	const assetTypeCount = await uncachedPrisma.assetType.count();
	const transactionCategoryCount = await uncachedPrisma.transactionCategory.count();
	const transactionCategoryGroupCount = await uncachedPrisma.transactionCategoryGroup.count();
	uncachedPrisma.$disconnect();

	const isSeedable = [
		accountTypeCount,
		assetTypeCount,
		transactionCategoryCount,
		transactionCategoryGroupCount
	].includes(0);

	// If any of these models has seeded data but others don't something is wrong
	const isIncorrectlySeeded =
		isSeedable &&
		(accountTypeCount > 0 ||
			assetTypeCount > 0 ||
			transactionCategoryCount > 0 ||
			transactionCategoryGroupCount > 0);

	if (isIncorrectlySeeded) return false;

	if (isSeedable) {
		try {
			await runPrismaSeed();
			validateVaultSeed(true);
		} catch {
			if (ranTwice) return false;
		}
	}

	return true;
};

export const handleError = (error: any, modelName: string): CRUDResponse => {
	switch (error.code) {
		case 'P2002':
			return { error: `An ${modelName} with the same name already exists` };
		case 'P2025':
			return { error: `The ${modelName} doesn't exist` };
		default:
			return { error };
	}
};

export interface CRUDResponse {
	payload?: any; // Prisma.BatchPayload | Account | Asset | Transaction
	error?: string;
}

export const crudResponse = (response: CRUDResponse): Response => {
	return json(response);
};

// Default Prisma client
const prisma = new PrismaClient();

export default prisma;
