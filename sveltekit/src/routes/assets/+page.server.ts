import { getUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prisma.server';
import type { Asset, AssetType } from '@prisma/client';
import { getAssetCurrentBalance } from '$lib/helpers/models.server';

interface AssetSummary extends Asset {
	lastUpdated: number;
	value: number;
	quantity: number;
	cost: number;
	assetType: AssetType;
}

export const load = async () => {
	const assets = await prisma.asset.findMany({
		include: {
			assetBalanceStatements: true,
			assetType: true
		},
		orderBy: {
			name: 'asc'
		}
	});

	const assetSummaries: AssetSummary[] = await Promise.all(
		assets.map(async (asset) => {
			const lastBalanceStatement =
				asset.assetBalanceStatements[asset.assetBalanceStatements.length - 1];

			const lastUpdated = lastBalanceStatement?.createdAt || asset.updatedAt;

			return {
				...asset,
				lastUpdated: getUnixTime(lastUpdated),
				value: await getAssetCurrentBalance(asset),
				quantity: lastBalanceStatement?.quantity || 0,
				cost: lastBalanceStatement?.cost || 0
			};
		})
	);

	return { assets: assetSummaries };
};
