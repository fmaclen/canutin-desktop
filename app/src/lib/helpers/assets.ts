import prisma from '$lib/helpers/prismaClient';
import type { Asset } from '@prisma/client';
import { SortOrder } from './constants';

export const getAssetCurrentBalance = async (asset: Asset) => {
	const lastBalanceStatement = await prisma.assetBalanceStatement.findFirst({
		where: {
			assetId: asset.id
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	return lastBalanceStatement?.value ? lastBalanceStatement.value : 0;
};
