import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';

interface NewAsset {
	name: string;
	assetTypeId: number;
	balanceGroup: number;
	value: number;
	symbol?: string;
	quantity?: number;
	cost?: number;
}

export const POST = async ({ request }: RequestEvent) => {
	const newAsset: NewAsset = await request.json();

	const existingAsset = await prisma.asset.findUnique({ where: { name: newAsset.name } });

	if (existingAsset) {
		return json({ error: 'An asset with the same name already exists' });
	}

	const asset = await prisma.asset.create({
		data: {
			name: newAsset.name,
			assetTypeId: newAsset.assetTypeId,
			symbol: newAsset.symbol,
			balanceGroup: 1,
			isSold: false
		}
	});

	return json({ id: asset.id });
};
