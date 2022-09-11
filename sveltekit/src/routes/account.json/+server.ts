import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';

export const POST = async ({ request }: RequestEvent) => {
	const payload: Prisma.AccountUncheckedCreateInput = await request.json();

	console.log(payload);

	// Create new Account
	if (payload) {
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
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return json({ error: { name: 'An account with the same name already exists' } });
				} else {
					return json({ error: 'An error occurred' });
				}
			}
		}
	}
};

// Update account
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: Prisma.AccountUncheckedCreateInput = await request.json();

	console.log(payload);

	if (payload) {
		if (!payload.id || !payload.name || !payload.accountTypeId || !(payload.balanceGroup >= 0)) {
			return json({ error: 'Insufficient data' });
		}

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
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return json({ error: { name: 'An account with the same name already exists' } });
				} else {
					return json({ error: 'An error occurred' });
				}
			}
		}
	}
};
