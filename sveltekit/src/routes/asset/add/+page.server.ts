import {
	getSelectAssetTypes,
	getQuantifiableAssetTypes,
	selectBalanceGroups
} from '$lib/helpers/forms';

export const load = async () => {
	const selectAssetTypes = await getSelectAssetTypes();
	const quantifiableAssetTypes = await getQuantifiableAssetTypes();

	return {
		selectAssetTypes,
		selectBalanceGroups,
		quantifiableAssetTypes
	};
};
