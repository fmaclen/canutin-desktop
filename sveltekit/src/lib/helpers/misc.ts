import { redirect } from '@sveltejs/kit';
import formatInTimeZone from 'date-fns-tz/esm/formatInTimeZone';

import { SortOrder } from '$lib/helpers/constants';

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

export const formatPercentage = (value: number) => {
	const calculateFractionDigits = (value: number) => {
		const valueLength = Math.round(value).toString().length;
		if (value === 0 || valueLength > 2) return 0;
		if (valueLength < 2) return 2;
		if (valueLength < 3) return 1;
	};

	return new Intl.NumberFormat(LOCALE, {
		style: 'percent',
		minimumFractionDigits: calculateFractionDigits(value)
	}).format(value / 100);
};

export const growthPercentage = (initialAmount: number, finalAmount: number): number => {
	if (initialAmount === 0)
		throw new Error('Initial amount cannot be zero when calculating growth percentage.');
	return ((Math.abs(finalAmount) - Math.abs(initialAmount)) / Math.abs(initialAmount)) * 100;
};

export const sortByKey = (array: any[], key: string, order: SortOrder) => {
	order == SortOrder.DESC
		? array.sort((a, b) => (Math.abs(a[key]) > Math.abs(b[key]) ? 1 : -1))
		: array.sort((a, b) => (Math.abs(a[key]) < Math.abs(b[key]) ? 1 : -1));
};

export const sortByNumber = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	// If the property is null or undefined, set it to 0
	const valueA: number = (a as unknown as number) ?? 0;
	const valueB: number = (b as unknown as number) ?? 0;
	return sortOrder === SortOrder.DESC ? valueB - valueA : valueA - valueB;
};

export const sortByString = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	// If the property is null or undefined, set it to an empty string
	const valueA: string = (a as unknown as string) ?? '';
	const valueB: string = (b as unknown as string) ?? '';
	if (sortOrder === SortOrder.DESC) {
		return valueA.localeCompare(valueB);
	} else {
		return valueB.localeCompare(valueA);
	}
};

export const sortByBoolean = <T>(a: T, b: T, sortOrder: SortOrder): number => {
	return sortOrder === SortOrder.DESC ? +a - +b : +b - +a;
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
