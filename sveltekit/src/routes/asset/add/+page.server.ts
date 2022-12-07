import { getSelectAssetTypes, getQuantifiableAssetTypes } from '$lib/helpers/forms.server';
import { selectBalanceGroups } from '$lib/helpers/forms';

export const load = async () => {
	const selectAssetTypes = await getSelectAssetTypes();
	const quantifiableAssetTypes = await getQuantifiableAssetTypes();

	return {
		selectAssetTypes,
		selectBalanceGroups,
		quantifiableAssetTypes
	};
};
