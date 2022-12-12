import { type RequestEvent, json } from '@sveltejs/kit';
import { startOfMonth, endOfMonth, sub, fromUnixTime, getUnixTime } from 'date-fns';

import type {
	Prisma,
	Account,
	Transaction,
	TransactionCategory,
	TransactionImport
} from '@prisma/client';
import prisma, { crudResponse, handleError } from '$lib/helpers/prisma.server';
import { Appearance, SortOrder } from '$lib/helpers/constants';
import { createSuccessEvent } from '$lib/helpers/events.server';

export interface TransactionResponse extends Omit<Transaction, 'date'> {
	date: number;
	transactionImport: TransactionImport | null;
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

	let keyword: string | undefined = paramKeyword;
	let isExcluded: boolean | undefined = undefined;
	let isPending: boolean | undefined = undefined;

	const accountIds: number[] = [];
	const categoryIds: number[] = [];
	const values: number[] = [];

	// Parse accountIds, categoryIds, `excluded` and `pending` filters from keyword
	// e.g. `accountIds:1,2,3 categoryIds:4,5,6 excluded:true pending:false`
	//
	// Every filter found is removed from the `keyword` string so what's left can
	// be used as a regular search term

	// Filter: isExcluded
	const excludedRegex = new RegExp('excluded:(true|false)');
	const excludedMatch = keyword?.match(excludedRegex);
	if (excludedMatch) {
		isExcluded = excludedMatch[1] === 'true';
		keyword = keyword?.replace(excludedRegex, '').trim();
	}

	// Filter: isPending
	const pendingRegex = new RegExp('pending:(true|false)');
	const pendingMatch = keyword?.match(pendingRegex);
	if (pendingMatch) {
		isPending = pendingMatch[1] === 'true';
		keyword = keyword?.replace(pendingRegex, '').trim();
	}

	// Filter: accountIds
	const accountIdsRegex = new RegExp('accountId:\\d+', 'g');
	const accountIdsMatch = keyword?.match(accountIdsRegex);
	if (accountIdsMatch) {
		accountIdsMatch.forEach((accountIdMatch) => {
			accountIds.push(parseInt(accountIdMatch.replace('accountId:', '')));
			keyword = keyword?.replace(accountIdMatch, '').trim();
		});
	}

	// Filter: categoryIds
	const categoryIdsRegex = new RegExp('categoryId:\\d+', 'g');
	const categoryIdsMatch = keyword?.match(categoryIdsRegex);
	if (categoryIdsMatch) {
		categoryIdsMatch.forEach((categoryIdMatch) => {
			categoryIds.push(parseInt(categoryIdMatch.replace('categoryId:', '')));
			keyword = keyword?.replace(categoryIdMatch, '').trim();
		});
	}

	// Parse numbers from keyword
	const valueInKeywords = keyword?.match(/-?\d+([.,]\d+)?/g);
	if (valueInKeywords) {
		valueInKeywords.map((valueInKeyword) => {
			const parsedValue = parseFloat(valueInKeyword?.replace(',', '.'));
			values.push(parsedValue);
			values.push(parsedValue * -1);
			keyword = keyword?.replace(valueInKeyword, '').trim();
		});
	}

	// Build search query
	const transactions = await prisma.transaction.findMany({
		where: {
			accountId: {
				in: accountIds.length > 0 ? accountIds : undefined
			},
			categoryId: {
				in: categoryIds.length > 0 ? categoryIds : undefined
			},
			value: {
				in: values.length > 0 ? values : undefined
			},
			isExcluded: {
				equals: isExcluded !== undefined ? isExcluded : undefined
			},
			isPending: {
				equals: isPending !== undefined ? isPending : undefined
			},
			date: {
				lte: dateTo,
				gte: dateFrom
			},
			// If `keyword` is not empty after parsing, search across:
			// description, category names or account names.
			OR: [
				{
					description: {
						contains: keyword
					}
				},
				{
					transactionCategory: {
						name: {
							contains: categoryIds.length > 0 ? undefined : keyword
						}
					}
				},
				{
					account: {
						name: {
							contains: accountIds.length > 0 ? undefined : keyword
						}
					}
				}
			]
		},
		include: {
			transactionImport: true,
			transactionCategory: true,
			account: true
		},
		orderBy: Object.fromEntries([[paramSortBy, paramSortOrder]])
	});

	// Endpoint body gets returned as serialized JSON so we convert the date to Unix timestamps.
	const transactionsResponse: TransactionResponse[] = transactions.map((transaction) => ({
		...transaction,
		date: getUnixTime(transaction.date)
	}));

	return json({
		transactions: transactionsResponse
	});
};

export interface BatchEditResponse {
	transactionIds: number[];
	updatedProps: Prisma.TransactionUncheckedUpdateManyInput;
}

// Batch edit transactions
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: BatchEditResponse = await request.json();

	if (payload.transactionIds.length < 2 || !payload.updatedProps)
		return json({ error: 'Insufficient data' });

	// Convert the date from Unix timestamp to a Date object.
	if (typeof payload.updatedProps.date === 'string') {
		payload.updatedProps.date = fromUnixTime(parseInt(payload.updatedProps.date));
	}

	const { transactionIds, updatedProps } = payload;
	try {
		const updatedTransactions = await prisma.transaction.updateMany({
			where: {
				id: {
					in: transactionIds
				}
			},
			data: updatedProps
		});

		await createSuccessEvent(`${updatedTransactions.count} transactions were updated`);
		return crudResponse({ payload: updatedTransactions });
	} catch (error) {
		return crudResponse(handleError(error, 'transactions'));
	}
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

		await createSuccessEvent(
			`${transactionCount.count} transactions were deleted`,
			Appearance.ACTIVE
		);
		return crudResponse({ payload: transactionCount });
	} catch (error) {
		return crudResponse(handleError(error, 'transactions'));
	}
};
