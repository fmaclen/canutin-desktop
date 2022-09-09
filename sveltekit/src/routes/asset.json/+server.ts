import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';

interface AssetUpdateInput {
	name: string;
	assetTypeId: number;
	balanceGroup: number;
	isSold: boolean;
	symbol?: string;
	id?: number;
}

interface AssetBalanceStatementUpdateInput {
	assetId: number;
	value: number;
	quantity?: number;
	cost?: number;
}

interface AssetPayload {
	assetUpdateInput?: AssetUpdateInput;
	assetBalanceStatementUpdateInput: AssetBalanceStatementUpdateInput;
}

export const POST = async ({ request }: RequestEvent) => {
	const payload: AssetPayload = await request.json();
	const { assetUpdateInput, assetBalanceStatementUpdateInput } = payload;

	// Create new Asset
	if (assetUpdateInput) {
		if (
			!assetUpdateInput.name ||
			!assetUpdateInput.assetTypeId ||
			!(assetUpdateInput.balanceGroup >= 0)
		) {
			return json({ error: 'Insufficient data' });
		}

		try {
			const asset = await prisma.asset.create({
				data: {
					...assetUpdateInput
				}
			});
			return json({ id: asset.id });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return json({ error: { name: 'An asset with the same name already exists' } });
				} else {
					return json({ error: 'An error occurred' });
				}
			}
		}
	}

	// Create new AssetBalanceStatement
	if (assetBalanceStatementUpdateInput) {
		if (!assetBalanceStatementUpdateInput.assetId || !assetBalanceStatementUpdateInput.value)
			return json({ error: 'Insufficient data' });

		try {
			const assetBalanceStatement = await prisma.assetBalanceStatement.create({
				data: {
					...assetBalanceStatementUpdateInput
				}
			});
			return json({ id: assetBalanceStatement.id });
		} catch (error) {
			return json({ error: 'An error occurred' });
		}
	}
};

// Update asset
export const PATCH = async ({ request }: RequestEvent) => {
	const payload: AssetPayload = await request.json();

	const { assetUpdateInput } = payload;

	if (assetUpdateInput) {
		if (
			!assetUpdateInput.id ||
			!assetUpdateInput.name ||
			!assetUpdateInput.assetTypeId ||
			!(assetUpdateInput.balanceGroup >= 0)
		) {
			return json({ error: 'Insufficient data' });
		}

		try {
			const asset = await prisma.asset.update({
				where: { id: assetUpdateInput.id },
				data: {
					...assetUpdateInput
				}
			});
			return json({ id: asset.id });
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					return json({ error: { name: 'An asset with the same name already exists' } });
				} else {
					return json({ error: 'An error occurred' });
				}
			}
		}
	}
};
