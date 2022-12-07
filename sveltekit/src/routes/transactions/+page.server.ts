import { SortOrder } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma.server';

export const load = async () => {
	const earliestTransaction = await prisma.transaction.findFirst({
		orderBy: {
			date: SortOrder.ASC
		}
	});

	const latestTransaction = await prisma.transaction.findFirst({
		orderBy: {
			date: SortOrder.DESC
		}
	});

	return {
		earliestTransactionDate: earliestTransaction?.date,
		latestTransactionDate: latestTransaction?.date
	};
};
