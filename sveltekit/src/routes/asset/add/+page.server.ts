import { BalanceGroup, getBalanceGroupLabel } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma';

export const load = async () => {
	// Get list of asset types and format it for the select field
	const assetTypesUnformatted = await prisma.assetType.findMany({
		select: { id: true, name: true }
	});
	const assetTypes = assetTypesUnformatted.map((assetType) => ({
		label: assetType.name,
		value: assetType.id
	}));

	// Asset types that can be expressed by quantity/cost
	const quantifiableAssetTypeNames = ['Security', 'Cryptocurrency', 'Precious metal'];
	const quantifiableAssetTypes = assetTypes
		.filter((assetType) => quantifiableAssetTypeNames.includes(assetType.label))
		.map((assetType) => assetType.value);

	const balanceGroups = [
		{ label: getBalanceGroupLabel(BalanceGroup.CASH) },
		{ label: getBalanceGroupLabel(BalanceGroup.DEBT) },
		{ label: getBalanceGroupLabel(BalanceGroup.INVESTMENTS) },
		{ label: getBalanceGroupLabel(BalanceGroup.OTHER_ASSETS) }
	];

	return {
		assetTypes,
		quantifiableAssetTypes,
		balanceGroups
	};
};
