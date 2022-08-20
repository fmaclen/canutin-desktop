import path from 'path';
import { DeveloperFunctions } from '$lib/helpers/constants';
import prisma, { runPrismaCommand } from '$lib/helpers/prismaClient';
// import seedDemoData from '$lib/seed';

export const POST = async ({ url }: { url: URL }) => {
	const searchParams = url.searchParams.get('functionType');
	const functionType = searchParams && parseInt(searchParams);

	const schemaPath = path.join(process.env.ELECTRON_APP_PATH, 'prisma/schema.prisma');

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE:
			await prisma.account.deleteMany({});
			await prisma.asset.deleteMany({});
			break;
		case DeveloperFunctions.DB_SEED:
			// await seedDemoData();
			await runPrismaCommand({
				command: ['migrate', 'dev', '--schema', schemaPath]
			});
			await runPrismaCommand({
				command: ['db', 'seed']
			});

			break;
	}

	return new Response(undefined);
};
