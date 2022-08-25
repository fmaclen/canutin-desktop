import prisma from '$lib/helpers/prisma';
import seedDemoData from '$lib/seed';
import { DeveloperFunctions } from '$lib/helpers/constants';
import { env } from '$env/dynamic/private';

export const POST = async ({ url }: { url: URL }) => {
	const functionTypeParam = url.searchParams.get('functionType');
	const functionType = functionTypeParam && parseInt(functionTypeParam);

	const dbUrlParam = url.searchParams.get('dbUrl');
	const dbUrl = dbUrlParam ? dbUrlParam : env.DATABASE_URL;

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE:
			await prisma.account.deleteMany({});
			await prisma.asset.deleteMany({});
			break;

		case DeveloperFunctions.DB_SEED:
			await seedDemoData();
			break;

		case DeveloperFunctions.DB_SET_URL:
			process.env.ELECTRON_SWITCHED_VAULT = 'true';
			env.ELECTRON_SWITCHED_VAULT = 'true';
			process.env.DATABASE_URL = dbUrl;
			env.DATABASE_URL = dbUrl;
			break;
	}

	return new Response(undefined);
};
