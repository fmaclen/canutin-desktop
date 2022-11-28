// FIXME: this should be moved to a `load()` function in `assets/+page.server.ts`

import { json } from '@sveltejs/kit';
import { getUnixTime } from 'date-fns';

import prisma from '$lib/helpers/prisma';
import type { Asset, AssetType } from '@prisma/client';
import { getAssetCurrentBalance } from '$lib/helpers/models';

export interface AssetResponse extends Asset {
	lastUpdated: number;
	value: number;
	quantity: number;
	cost: number;
	assetType: AssetType;
}

export const GET = async () => {
	const assets = await prisma.asset.findMany({
		include: {
			assetBalanceStatements: true,
			assetType: true
		},
		orderBy: {
			name: 'asc'
		}
	});

	const assetsResponse: Promise<AssetResponse[]> = Promise.all(
		assets.map(async (asset) => {
			const lastBalanceStatement =
				asset.assetBalanceStatements[asset.assetBalanceStatements.length - 1];

			return {
				...asset,
				lastUpdated: getUnixTime(asset.updatedAt),
				value: await getAssetCurrentBalance(asset),
				quantity: lastBalanceStatement?.quantity || 0,
				cost: lastBalanceStatement?.cost || 0
			};
		})
	);

	return json(await assetsResponse);
};
