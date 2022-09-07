import { redirect } from '@sveltejs/kit';
import {
	getSelectAssetTypes,
	getQuantifiableAssetTypes,
	selectBalanceGroups
} from '$lib/helpers/forms';
import prisma from '$lib/helpers/prisma';
import type { Asset } from '@prisma/client';

interface Params {
	slug: string | null;
}

const returnNotFound = () => {
	throw redirect(307, '/404');
};

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug) returnNotFound();

	const asset = (await prisma.asset.findUnique({ where: { id: parseInt(slug!) } })) as Asset;

	if (!asset) returnNotFound();

	const selectAssetTypes = await getSelectAssetTypes();
	const quantifiableAssetTypes = await getQuantifiableAssetTypes();

	return {
		asset,
		selectAssetTypes,
		selectBalanceGroups,
		quantifiableAssetTypes
	};
};
