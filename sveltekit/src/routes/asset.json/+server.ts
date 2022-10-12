import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { handleError } from '$lib/helpers/prisma';

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
		return json(handleError(error, 'asset'));
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
		return json(handleError(error, 'asset'));
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const asset = await prisma.asset.delete({
			where: { id: payload }
		});
		return json({ id: asset.id });
	} catch (error) {
		return json(handleError(error, 'asset'));
	}
};
