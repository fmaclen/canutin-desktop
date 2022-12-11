import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { crudResponse, handleError } from '$lib/helpers/prisma.server';
import { createSuccessEvent } from '$lib/helpers/events.server';
import { Appearance } from '$lib/helpers/constants';

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
		createSuccessEvent(`${account.name} was created successfully`, Appearance.POSITIVE);
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAccountError(error);
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
		createSuccessEvent(`${account.name} was updated successfully`, Appearance.POSITIVE);
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAccountError(error);
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const account = await prisma.account.delete({
			where: { id: payload }
		});
		createSuccessEvent(`${account.name} was deleted`, Appearance.ACTIVE);
		return json({ id: account.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAccountError(error);
	}
};

const handleAccountError = (error: any) => {
	const errorResponse = handleError(error, 'account');
	createSuccessEvent(errorResponse.error, Appearance.NEGATIVE);
	return crudResponse(errorResponse);
};
