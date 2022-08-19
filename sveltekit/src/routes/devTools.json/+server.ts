import { DeveloperFunctions } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prismaClient';
import seedDemoData from '$lib/seed';

export const POST = async ({ url }: { url: URL }) => {
	const searchParams = url.searchParams.get('functionType');
	const functionType = searchParams && parseInt(searchParams);

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE:
			await prisma.account.deleteMany({});
			await prisma.asset.deleteMany({});
			break;
		case DeveloperFunctions.DB_SEED:
			await seedDemoData();
			break;
	}

	return new Response(undefined);
};
