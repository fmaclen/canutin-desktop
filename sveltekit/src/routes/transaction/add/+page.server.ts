import { getSelectTransactionCategories, getSelectAccounts } from '$lib/helpers/forms.server';

export const load = async () => {
	const selectAccounts = await getSelectAccounts();
	const selectTransactionCategories = await getSelectTransactionCategories();

	return {
		selectAccounts,
		selectTransactionCategories
	};
};
