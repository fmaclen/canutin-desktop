import { getSelectAccountTypes, selectBalanceGroups } from '$lib/helpers/forms';

export const load = async () => {
	const selectAccountTypes = await getSelectAccountTypes();

	return {
		selectAccountTypes,
		selectBalanceGroups
	};
};
