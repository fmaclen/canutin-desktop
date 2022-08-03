import prisma from '$lib/helpers/prismaClient';

export const POST = async () => {
	await prisma.account.deleteMany({});
	await prisma.asset.deleteMany({});

	return {
		status: 200
	};
};
