import fs from 'fs';
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

const stream = fs.createWriteStream('/Users/odyssey/Desktop/output.txt');

export const runPrismaCommand = async ({ command }: { command: string[] }): Promise<number> => {
	const mePath = path.join(
		process.env.ELECTRON_APP_PATH,
		platformToExecutables[process.platform].migrationEngine
	);

	stream.write(
		`\n process.cwd(): ${process.cwd()} \n ELECTRON_APP_PATH: ${
			process.env.ELECTRON_APP_PATH
		} \n mePath: ${mePath} \n`
	);

	try {
		const exitCode = await new Promise((resolve, _) => {
			const prismaPath = path.resolve(
				process.env.ELECTRON_APP_PATH,
				'node_modules/prisma/build/index.js'
			);

			const child = fork(prismaPath, command, {
				env: {
					...process.env,
					PRISMA_MIGRATION_ENGINE_BINARY: mePath,
					PRISMA_QUERY_ENGINE_LIBRARY: path.join(
						process.env.ELECTRON_APP_PATH,
						platformToExecutables[process.platform].queryEngine
					)
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
