import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';

const handleError = (error: any) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		return json({ error: { name: 'An account with the same name already exists' } });
	} else {
		return json({ error: true });
	}
};

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
		return json({ id: account.id });
	} catch (error) {
		return handleError(error);
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
		return json({ id: account.id });
	} catch (error) {
		return handleError(error);
	}
};
