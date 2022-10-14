import {
	getSelectAssetTypes,
	getQuantifiableAssetTypes,
	selectBalanceGroups
} from '$lib/helpers/forms';
import prisma from '$lib/helpers/prisma';
import type { Asset } from '@prisma/client';
import { SortOrder } from '$lib/helpers/constants';
import { notFound } from '$lib/helpers/misc';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug || Number.isNaN(parseInt(slug))) return notFound();

	const asset = (await prisma.asset.findUnique({ where: { id: parseInt(slug) } })) as Asset;

	if (!asset) return notFound();

	const selectAssetTypes = await getSelectAssetTypes();
	const quantifiableAssetTypes = await getQuantifiableAssetTypes();

	const lastBalanceStatement = await prisma.assetBalanceStatement.findFirst({
		where: {
			assetId: asset.id
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	return {
		asset,
		selectAssetTypes,
		selectBalanceGroups,
		quantifiableAssetTypes,
		lastBalanceStatement
	};
};
