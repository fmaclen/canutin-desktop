import { json } from '@sveltejs/kit';
import { Prisma } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';
import type { AssetFormPayload } from '$lib/helpers/forms';

export const POST = async ({ request }: RequestEvent) => {
	const payload: AssetFormPayload = await request.json();
	const { assetForm, assetBalanceStatementForm } = payload;

	// Create new Asset
	if (assetForm) {
		if (!assetForm.name || !assetForm.assetTypeId || !(assetForm.balanceGroup >= 0)) {
			return json({ error: 'Insufficient data' });
		}

		try {
			const asset = await prisma.asset.create({
				data: {
					...assetForm
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
	if (assetBalanceStatementForm) {
		if (!assetBalanceStatementForm.assetId || !assetBalanceStatementForm.value)
			return json({ error: 'Insufficient data' });

		try {
			const assetBalanceStatement = await prisma.assetBalanceStatement.create({
				data: {
					...assetBalanceStatementForm
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
	const payload: AssetFormPayload = await request.json();

	const { assetForm } = payload;

	if (assetForm) {
		if (
			!assetForm.id ||
			!assetForm.name ||
			!assetForm.assetTypeId ||
			!(assetForm.balanceGroup >= 0)
		) {
			return json({ error: 'Insufficient data' });
		}

		try {
			const asset = await prisma.asset.update({
				where: { id: assetForm.id },
				data: {
					...assetForm
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
