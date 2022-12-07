import { getSelectAccountTypes } from '$lib/helpers/forms.server';
import { selectBalanceGroups } from '$lib/helpers/forms';

export const load = async () => {
	const selectAccountTypes = await getSelectAccountTypes();

	return {
		selectAccountTypes,
		selectBalanceGroups
	};
};
