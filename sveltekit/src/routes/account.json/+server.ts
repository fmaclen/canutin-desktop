import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { crudResponse, handleError } from '$lib/helpers/prisma';

// Create new account
export const POST = async ({ request }: RequestEvent) => {
	const payload: Prisma.AccountUncheckedCreateInput = await request.json();
	if (!payload.name || !payload.accountTypeId || !(payload.balanceGroup >= 0)) {
		return json({ error: 'Insufficient data' });
	}

	try {
		const account = await prisma.account.create({
			data: {
				...payload
			}
		});
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'account'));
	}
};

// Update account
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: Prisma.AccountUncheckedCreateInput = await request.json();
	if (!payload.id) return json({ error: 'Insufficient data' });

	try {
		const account = await prisma.account.upsert({
			where: { id: payload.id },
			update: {
				...payload
			},
			create: {
				...payload
			}
		});
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'account'));
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const account = await prisma.account.delete({
			where: { id: payload }
		});
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return crudResponse(handleError(error, 'account'));
	}
};
