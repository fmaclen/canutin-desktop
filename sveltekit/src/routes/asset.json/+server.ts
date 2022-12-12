import { json } from '@sveltejs/kit';
import type { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import prisma, { handleError, crudResponse } from '$lib/helpers/prisma.server';
import { createErrorEvent, createSuccessEvent } from '$lib/helpers/events.server';
import { Appearance } from '$lib/helpers/constants';

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
		await createSuccessEvent(`${asset.name} was created`);
		return json({ id: asset.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAssetError(error);
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
		await createSuccessEvent(`${asset.name} was updated`);
		return json({ id: asset.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAssetError(error);
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const payload: number = await request.json();

	try {
		const asset = await prisma.asset.delete({
			where: { id: payload }
		});
		await createSuccessEvent(`${asset.name} was deleted`, Appearance.ACTIVE);
		return json({ id: asset.id }); // FIXME: should return crudResponse
	} catch (error) {
		return handleAssetError(error);
	}
};

const handleAssetError = async (error: any) => {
	const errorResponse = handleError(error, 'asset');
	await createErrorEvent(errorResponse.error);
	return crudResponse(errorResponse);
};
