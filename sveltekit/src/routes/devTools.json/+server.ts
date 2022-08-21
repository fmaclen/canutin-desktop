import path from 'path';
import { fork } from 'child_process';

import { DeveloperFunctions } from '$lib/helpers/constants';
import prisma, { runPrismaCommand } from '$lib/helpers/prismaClient';
// import seedDemoData from '$lib/seed';

export const POST = async ({ url }: { url: URL }) => {
	const searchParams = url.searchParams.get('functionType');
	const functionType = searchParams && parseInt(searchParams);

	const seedModulePath = path.join(process.env.SVELTEKIT_PATH, 'prisma', 'seed.js');

	console.log(seedModulePath);

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE:
			await prisma.account.deleteMany({});
			await prisma.asset.deleteMany({});
			break;
		case DeveloperFunctions.DB_SEED:
			// await seedDemoData();
			await runPrismaCommand({
				command: ['migrate', 'dev']
			});

			// Seed the vault if it's new
			if (process.env.IS_NEW_VAULT === 'true') {
				fork(seedModulePath, { stdio: 'inherit' });
			}

			break;
	}

	return new Response(undefined);
};
