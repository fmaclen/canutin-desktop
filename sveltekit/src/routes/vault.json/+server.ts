import { getUnixTime } from 'date-fns';
import { json } from '@sveltejs/kit';

import { getPrismaModelNames } from '$lib/helpers/prisma';
import { SortOrder } from '$lib/helpers/constants';
import { PrismaClient } from '@prisma/client';

export const GET = async () => {
	// PrismaClient seems to cache results so we need to instantiate a new client
	const uncachedPrisma = new PrismaClient();

	interface ModelRecord {
		updatedAt: Date;
	}

	const models = getPrismaModelNames();

	// Query each of the models and get the most recent record
	let mostRecentRecords: ModelRecord[] = [];
	for (const model of models) {
		mostRecentRecords.push(
			// REF: https://github.com/prisma/prisma/issues/5273
			// @ts-expect-error "This expression is not callable"
			await uncachedPrisma[model].findFirst({ orderBy: { updatedAt: SortOrder.DESC } })
		);
	}
	uncachedPrisma.$disconnect();

	// Some queries might return `null` so we need to remove them
	mostRecentRecords = mostRecentRecords.filter((record) => record !== null);

	// Sort mostRecentRecords by `updatedAt`
	mostRecentRecords.sort((a, b) => {
		return b.updatedAt.getTime() - a.updatedAt.getTime();
	});

	return json({
		lastDataUpdate: getUnixTime(mostRecentRecords[0].updatedAt)
	});
};
