import { getUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prisma';
import type { Asset, AssetType } from '@prisma/client';
import { getAssetCurrentBalance } from '$lib/helpers/models';

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

	const assetSummaries: Promise<AssetSummary[]> = Promise.all(
		assets.map(async (asset) => {
			const lastBalanceStatement =
				asset.assetBalanceStatements[asset.assetBalanceStatements.length - 1];

			return {
				...asset,
				lastUpdated: getUnixTime(lastBalanceStatement.createdAt),
				value: await getAssetCurrentBalance(asset),
				quantity: lastBalanceStatement?.quantity || 0,
				cost: lastBalanceStatement?.cost || 0
			};
		})
	);

	return { assets: assetSummaries };
};
