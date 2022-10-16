import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { handleError, crudResponse } from '$lib/helpers/prisma';
import { fromUnixTime } from 'date-fns';

// Create new transaction
export const POST = async ({ request }: RequestEvent) => {
	const payload: Prisma.TransactionUncheckedCreateInput = await request.json();

	// HACK: `payload.date` is actually a number but it conflicts with the type
	// `Prisma.TransactionUncheckedCreateInput`
	payload.date = fromUnixTime(payload.date as any);

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

		return json({ id: transaction.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'transaction'));
	}
};

// Update transaction
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: Prisma.TransactionUncheckedCreateInput = await request.json();

	// HACK: `payload.date` is actually a number but it conflicts with the type
	// `Prisma.TransactionUncheckedCreateInput`
	payload.date = fromUnixTime(payload.date as any);

	if (!payload.id) return json({ error: 'Insufficient data' });

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
		return json({ id: transaction.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'transaction'));
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const transaction = await prisma.transaction.delete({
			where: { id: payload }
		});
		return json({ id: transaction.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'transaction'));
	}
};
