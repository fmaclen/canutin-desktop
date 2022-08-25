import { SortOrder } from '$lib/helpers/constants';
import prisma, { getPrismaModelNames } from '$lib/helpers/prisma';
import { getUnixTime } from 'date-fns';

export const load = async () => {
	interface ModelRecord {
		updatedAt: Date;
	}

	const models = getPrismaModelNames();

	// Query each of the models and get the most recent record
	const mostRecentRecords: ModelRecord[] = [];
	for (const model of models) {
		mostRecentRecords.push(
			// REF: https://github.com/prisma/prisma/issues/5273
			// @ts-expect-error "This expression is not callable"
			await prisma[model].findFirst({ orderBy: { updatedAt: SortOrder.DESC } })
		);
	}

	// Sort mostRecentRecords by `updatedAt`
	mostRecentRecords.sort((a, b) => {
		return b.updatedAt.getTime() - a.updatedAt.getTime();
	});

	return {
		lastDataUpdate: getUnixTime(mostRecentRecords[0].updatedAt)
	};
};
