import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { handleError, crudResponse } from '$lib/helpers/prisma.server';
import { formatTransactionDate, formatTransactionDescription } from '$lib/helpers/models.server';
import { createErrorEvent, createSuccessEvent } from '$lib/helpers/events.server';
import { Appearance } from '$lib/helpers/constants';

// Create new transaction
export const POST = async ({ request }: RequestEvent) => {
	const payload: Prisma.TransactionUncheckedCreateInput = await request.json();

	// Normalize payload values
	payload.date = formatTransactionDate(payload.date);
	payload.description = formatTransactionDescription(payload.description);

	if (
		!payload.description ||
		!payload.accountId ||
		!payload.categoryId ||
		!payload.date ||
		(!payload.value && !(payload.value === 0))
	) {
		return json({ error: 'Insufficient data' });
	}

	try {
		const transaction = await prisma.transaction.create({
			data: {
				...payload
			}
		});

		await createSuccessEvent(`${transaction.description} was created`);
		return crudResponse({ payload: transaction.id });
	} catch (error) {
		return handleTransactionError(error);
	}
};

// Update transaction
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: Prisma.TransactionUncheckedCreateInput = await request.json();

	if (!payload.id) return json({ error: 'Insufficient data' });

	// Normalize payload values
	payload.date = formatTransactionDate(payload.date);
	payload.description = formatTransactionDescription(payload.description);

	try {
		const transaction = await prisma.transaction.upsert({
			where: { id: payload.id },
			update: {
				...payload
			},
			create: {
				...payload
			}
		});

		await createSuccessEvent(`${transaction.description} was updated`);
		return crudResponse({ payload: transaction.id });
	} catch (error) {
		return handleTransactionError(error);
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const transaction = await prisma.transaction.delete({
			where: { id: payload }
		});

		await createSuccessEvent(`${transaction.description} was deleted`, Appearance.ACTIVE);
		return crudResponse({ payload: transaction.id });
	} catch (error) {
		return handleTransactionError(error);
	}
};

const handleTransactionError = async (error: any) => {
	const errorResponse = handleError(error, 'transaction');
	await createErrorEvent(errorResponse.error);
	return crudResponse(errorResponse);
};
