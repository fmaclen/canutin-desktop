import { SortOrder } from '$lib/helpers/constants';

export const formatCurrency = (value: number) => {
	return new Intl.NumberFormat('en-US', {
		currency: 'USD',
		style: 'currency',
		maximumFractionDigits: 0
	}).format(value);
};

export const sortByKey = (array: any[], key: string, order: SortOrder) => {
	order == SortOrder.DESC
		? array.sort((a, b) => (Math.abs(a[key]) > Math.abs(b[key]) ? 1 : -1))
		: array.sort((a, b) => (Math.abs(a[key]) < Math.abs(b[key]) ? 1 : -1));
};
