import path from 'path';
import { fork } from 'child_process';
import { PrismaClient } from '@prisma/client';

const platformToExecutables: any = {
	win32: {
		migrationEngine: 'node_modules/@prisma/engines/migration-engine-windows.exe',
		queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node'
	},
	linux: {
		migrationEngine: 'node_modules/@prisma/engines/migration-engine-debian-openssl-1.1.x',
		queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node'
	},
	darwin: {
		migrationEngine: 'node_modules/@prisma/engines/migration-engine-darwin',
		queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node'
	}
};

export const runPrismaCommand = async ({ command }: { command: string[] }): Promise<number> => {
	const migrationEnginePath = path.join(
		process.env.SVELTEKIT_PATH,
		platformToExecutables[process.platform].migrationEngine
	);

	const queryEnginePath = path.join(
		process.env.SVELTEKIT_PATH,
		platformToExecutables[process.platform].queryEngine
	);

	try {
		const exitCode = await new Promise((resolve, _) => {
			const child = fork('node_modules/prisma/build/index.js', command, {
				cwd: process.env.SVELTEKIT_PATH,
				env: {
					...process.env,
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

		if (exitCode !== 0) throw Error(`command ${command} failed with exit code ${exitCode}`);

		return exitCode;
	} catch (e) {
		console.error(e);
		throw e;
	}
};

const prisma = new PrismaClient();

export default prisma;
