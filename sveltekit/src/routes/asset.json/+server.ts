import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';

const handleError = (error: any) => {
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		return json({ error: { name: 'An asset with the same name already exists' } });
	} else {
		return json({ error: true });
	}
};

// Create new asset
export const POST = async ({ request }: RequestEvent) => {
	const payload: Prisma.AssetUncheckedCreateInput = await request.json();
	if (!payload.name || !payload.assetTypeId || !(payload.balanceGroup >= 0)) {
		return json({ error: 'Insufficient data' });
	}

	try {
		const asset = await prisma.asset.create({
			data: {
				...payload
			}
		});
		return json({ id: asset.id });
	} catch (error) {
		return handleError(error);
	}
};

// Update asset
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: Prisma.AssetUncheckedCreateInput = await request.json();
	if (!payload.id) return json({ error: 'Insufficient data' });

	try {
		const asset = await prisma.asset.upsert({
			where: { id: payload.id },
			update: {
				...payload
			},
			create: {
				...payload
			}
		});
		return json({ id: asset.id });
	} catch (error) {
		return handleError(error);
	}
};
