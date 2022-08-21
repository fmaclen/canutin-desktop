import path from 'path';
import { fork } from 'child_process';
import { env } from '$env/dynamic/private';
import { PrismaClient } from '@prisma/client';

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

const cwd = env.SVELTEKIT_PATH ? env.SVELTEKIT_PATH : process.cwd();

const runPrismaMigrate = async (): Promise<number> => {
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
			const child = fork(prismaExecModule, ['migrate', 'dev'], {
				cwd,
				env: {
					...env,
					PRISMA_MIGRATION_ENGINE_BINARY: migrationEnginePath,
					PRISMA_QUERY_ENGINE_LIBRARY: queryEnginePath
				},
				stdio: 'inherit'
			});

			child.on('error', (err) => {
				console.error('Child process got error:', err);
			});

			child.on('close', (code, signal) => {
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

const runPrismaSeed = () => {
	const seedModulePath = path.join(cwd, 'prisma', 'seed.js');
	fork(seedModulePath, { stdio: 'inherit' });
};

const prisma = new PrismaClient();

export default prisma;
