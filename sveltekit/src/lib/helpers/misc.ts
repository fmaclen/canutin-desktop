import { redirect } from '@sveltejs/kit';
import formatInTimeZone from 'date-fns-tz/esm/formatInTimeZone';
import { BalanceGroup, SortOrder } from '$lib/helpers/constants';
import type { ChartDataset } from 'chart.js';

export const LOCALE = 'en-US';
const CURRENCY = 'USD';

// Format: $1,523.00 || -$1,523.00
export const formatCurrency = (
	value: number,
	maximumFractionDigits?: number,
	minimumFractionDigits?: number
) => {
	return new Intl.NumberFormat(LOCALE, {
		currency: CURRENCY,
		style: 'currency',
		maximumFractionDigits: maximumFractionDigits || 0,
		minimumFractionDigits: minimumFractionDigits || 0
	}).format(value);
};

export const sortByKey = (array: any[], key: string, order: SortOrder) => {
	order == SortOrder.DESC
		? array.sort((a, b) => (Math.abs(a[key]) > Math.abs(b[key]) ? 1 : -1))
		: array.sort((a, b) => (Math.abs(a[key]) < Math.abs(b[key]) ? 1 : -1));
};

// Calculates the ratio between the two numbers
export const proportionBetween = (num1: number, num2: number) => {
	return Math.round((!(num1 === 0) && !(num2 === 0) ? (num1 * 100) / num2 : 0) * 1e2) / 1e2;
};

// Strip timezone from date and set to UTC
export const dateInUTC = (date: Date) => {
	return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

export const formatInUTC = (date: Date, format: string) => {
	return formatInTimeZone(date, 'UTC', format);
};

interface Api {
	endpoint: string;
	method?: string;
	payload?: any;
	params?: string;
}

export const api = async ({ endpoint, method, payload, params }: Api) => {
	const response = await fetch(`/${endpoint}.json${params ? `?${params}` : ''}`, {
		method: method ? method : 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
		body: payload && JSON.stringify(payload)
	});
	return await response.json();
};

export const notFound = () => {
	throw redirect(307, '/404');
};

export const toCamelCase = (sentence: string) => {
	return sentence
		.split(' ')
		.map((word, index) => {
			if (index === 0) {
				return word.toLowerCase();
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('');
};

export const setChartDatasetColor = (dataset: ChartDataset, balanceGroup?: BalanceGroup) => {
	switch (balanceGroup) {
		case BalanceGroup.CASH:
			// var(--color-greenPrimary)
			dataset.backgroundColor = '#00A36F';
			dataset.borderColor = '#00A36F';
			break;
		case BalanceGroup.DEBT:
			// var(--color-redPrimary)
			dataset.backgroundColor = '#e75258';
			dataset.borderColor = '#e75258';
			break;
		case BalanceGroup.INVESTMENTS:
			// var(--color-goldPrimary)
			dataset.backgroundColor = '#B19B70';
			dataset.borderColor = '#B19B70';
			break;
		case BalanceGroup.OTHER_ASSETS:
			// var(--color-purplePrimary)
			dataset.backgroundColor = '#5255AC';
			dataset.borderColor = '#5255AC';
			break;
		default:
			// var(--color-grey80)
			dataset.backgroundColor = '#333333';
			dataset.borderColor = '#333333';
	}
};
