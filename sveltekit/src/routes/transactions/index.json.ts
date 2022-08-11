import { startOfMonth, endOfMonth, sub, fromUnixTime, getUnixTime } from 'date-fns';

import type { Account, Transaction, TransactionCategory } from '@prisma/client';
import prisma from '$lib/helpers/prismaClient';
import { SortOrder } from '$lib/helpers/constants';

export interface EndpointTransaction extends Omit<Transaction, 'date'> {
	date: number;
	transactionCategory: TransactionCategory;
	account: Account;
}

export const GET = async ({ url }: { url: URL }) => {
	const { searchParams } = url;

	const paramKeyword = searchParams.get('keyword') || undefined;
	const paramDateFrom = searchParams.get('dateFrom');
	const paramDateTo = searchParams.get('dateTo');
	const paramSortBy = searchParams.get('sortBy') || 'date';
	const paramSortOrder = searchParams.get('sortOrder') || SortOrder.DESC;

	const dateFrom = paramDateFrom
		? fromUnixTime(Date.parse(paramDateFrom) / 1000)
		: sub(startOfMonth(new Date()), { days: 90 });

	const dateTo = paramDateTo
		? fromUnixTime(Date.parse(paramDateTo) / 1000)
		: endOfMonth(new Date());

	// If a keyword param is provided we try to match it against the `description`
	// or `value` columns.
	const whereOr = () => {
		if (paramKeyword) {
			// For `value` we want to match the keyword number as positive and negative
			const paramKeywordAsNumber = !isNaN(parseFloat(paramKeyword))
				? parseFloat(paramKeyword)
				: undefined;

			return {
				OR: [
					{
						description: {
							contains: paramKeyword
						}
					},
					{
						transactionCategory: {
							name: { contains: paramKeyword }
						}
					},
					{
						account: {
							name: { contains: paramKeyword }
						}
					},
					{
						value: {
							equals: paramKeywordAsNumber
						}
					},
					{
						value: {
							equals: paramKeywordAsNumber ? paramKeywordAsNumber * -1 : undefined
						}
					}
				]
			};
		}
	};

	const transactions = await prisma.transaction.findMany({
		where: {
			date: {
				lte: dateTo,
				gte: dateFrom
			},
			...whereOr()
		},
		include: {
			transactionCategory: true,
			account: true
		},
		orderBy: Object.fromEntries([[paramSortBy, paramSortOrder]])
	});

	// Endpoint body gets returned as serialized JSON so we convert the date to Unix timestamps.
	const endpointTransactions: EndpointTransaction[] = transactions.map((transaction) => ({
		...transaction,
		date: getUnixTime(transaction.date)
	}));

	return {
		status: 200,
		body: {
			transactions: endpointTransactions
		}
	};
};
