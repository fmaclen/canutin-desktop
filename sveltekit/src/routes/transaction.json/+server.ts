import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';
import { fromUnixTime } from 'date-fns';

const handleError = (error: any) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		return json({ error: { name: 'An transaction with the same name already exists' } });
	} else {
		return json({ error });
	}
};

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

		return json({ id: transaction.id });
	} catch (error) {
		return handleError(error);
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
		return json({ id: transaction.id });
	} catch (error) {
		return handleError(error);
	}
};
