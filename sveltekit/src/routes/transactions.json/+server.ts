import { type RequestEvent, json } from '@sveltejs/kit';
import { startOfMonth, endOfMonth, sub, fromUnixTime, getUnixTime } from 'date-fns';

import type { Prisma, Account, Transaction, TransactionCategory } from '@prisma/client';
import prisma, { crudResponse, handleError, type CRUDResponse } from '$lib/helpers/prisma';
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

	return json({
		transactions: endpointTransactions
	});
};

// Batch delete transactions
export const DELETE = async ({ request }: RequestEvent) => {
	const payload: Transaction[] = await request.json();
	const transactionIds = payload.map((transaction) => transaction.id);

	try {
		const transactionCount = await prisma.transaction.deleteMany({
			where: {
				id: {
					in: transactionIds
				}
			}
		});

		return crudResponse({ payload: transactionCount });
	} catch (error) {
		return crudResponse(handleError(error, 'transactions'));
	}
};
