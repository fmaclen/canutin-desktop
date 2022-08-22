import path from 'path';
import { fork } from 'child_process';
import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';

const cwd = env.SVELTEKIT_PATH ? env.SVELTEKIT_PATH : process.cwd();

const platformToExecutables: any = {
	win32: {
		migrationEngine: '@prisma/engines/migration-engine-windows.exe',
		queryEngine: '@prisma/engines/query_engine-windows.dll.node'
	},
	linux: {
		migrationEngine: '@prisma/engines/migration-engine-debian-openssl-1.1.x',
		queryEngine: '@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node'
	},
	darwin: {
		migrationEngine: '@prisma/engines/migration-engine-darwin',
		queryEngine: '@prisma/engines/libquery_engine-darwin.dylib.node'
	}
};

export const runPrismaMigrate = async (): Promise<number> => {
	const nodeModulesPath = path.join(cwd, 'node_modules');

	const migrationEnginePath = path.join(
		nodeModulesPath,
		platformToExecutables[process.platform].migrationEngine
	);

	const queryEnginePath = path.join(
		nodeModulesPath,
		platformToExecutables[process.platform].queryEngine
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

export const runPrismaSeed = async (): Promise<number> => {
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

const prisma = new PrismaClient();

export default prisma;
