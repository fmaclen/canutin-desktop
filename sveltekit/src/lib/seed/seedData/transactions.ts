import { getTransactionCategoryId } from '$lib/helpers/models.server';
import { addDays, startOfMonth, subMonths } from 'date-fns';
import { dateInUTC } from '$lib//helpers/misc';

const MONTHS_IN_SET = 24;

export const accountCheckingTransactionSet = async () => {
	const transactionSet = async (i: number) => [
		{
			description: 'Westside Apartments',
			value: -2250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 0)),
			categoryId: await getTransactionCategoryId('Rent'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Initech HR * Payroll',
			value: 2800,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 5)),
			categoryId: await getTransactionCategoryId('Payroll & benefits'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to Ransack Savings',
			value: -250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			categoryId: await getTransactionCategoryId('Transfers'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Juggernaut Visa Payment',
			value: i % 2 === 0 ? -1750 : -1500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			categoryId: await getTransactionCategoryId('Payments'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Initech HR * Payroll',
			value: 2800,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 20)),
			categoryId: await getTransactionCategoryId('Payroll & benefits'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to Loot Financial',
			value: -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 24)),
			categoryId: await getTransactionCategoryId('Transfers'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Transfer to MegaCoin Exchange',
			value: i % 3 === 0 ? 0 : -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			categoryId: await getTransactionCategoryId('Transfers'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Toyota - TFS Payment',
			value: -500,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 27)),
			categoryId: await getTransactionCategoryId('Automotive'),
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < MONTHS_IN_SET; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};

export const accountSavingsTransactionSet = async () => {
	const transactionSet = async (i: number) => [
		{
			description: 'Transfer from Ransack Checking',
			value: 250,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			categoryId: await getTransactionCategoryId('Transfers'),
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < MONTHS_IN_SET; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};

export const accountCreditCardTransactionSet = async () => {
	const transactionSet = async (i: number) => [
		{
			description: 'Evergreen Market',
			value: -175.75,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 1)),
			categoryId: await getTransactionCategoryId('Groceries'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -135.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			categoryId: await getTransactionCategoryId('Groceries'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -189.25,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 15)),
			categoryId: await getTransactionCategoryId('Groceries'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Evergreen Market',
			value: -105.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 23)),
			categoryId: await getTransactionCategoryId('Groceries'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Chorizo King',
			value: -22.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 3)),
			categoryId: await getTransactionCategoryId('Food & drink'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Por Que No Los Tacos?',
			value: -19.25,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 6)),
			categoryId: await getTransactionCategoryId('Food & drink'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Mainely Lobster',
			value: -43.97,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 10)),
			categoryId: await getTransactionCategoryId('Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: "Maria's Artisanal Gelato",
			value: -12.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 11)),
			categoryId: await getTransactionCategoryId('Food & drink'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Sunset Cafe',
			value: -17.81,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 14)),
			categoryId: await getTransactionCategoryId('Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Stellar Burger',
			value: -16.23,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 20)),
			categoryId: await getTransactionCategoryId('Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: "Roy's Steakhouse",
			value: -55.78,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 25)),
			categoryId: await getTransactionCategoryId('Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Stellar Burger',
			value: -19.23,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			categoryId: await getTransactionCategoryId('Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'NetTV Max',
			value: -14.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 2)),
			categoryId: await getTransactionCategoryId('Subscriptions'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Store.com',
			value: -25.9,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 12)),
			categoryId: await getTransactionCategoryId('Shops'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Store.com',
			value: -24.21,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 18)),
			categoryId: await getTransactionCategoryId('Shops'),
			isExcluded: true,
			isPending: false
		},
		{
			description: 'Store.com (Refund)',
			value: -24.21,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			categoryId: await getTransactionCategoryId('Shops'),
			isExcluded: true,
			isPending: false
		},
		{
			description: 'Florida Man (Gas & Convinience Store)',
			value: -25.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 7)),
			categoryId: await getTransactionCategoryId('Gas stations'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Florida Man (Gas & Convinience Store)',
			value: -40.01,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 24)),
			categoryId: await getTransactionCategoryId('Gas stations'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Horizon Wireless',
			value: -90.5,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 2)),
			categoryId: await getTransactionCategoryId('Internet & phone'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Patriot Insurance',
			value: -135.67,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 27)),
			categoryId: await getTransactionCategoryId('Insurance'),
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 7 === 0 ? 'Hølm Home' : 'The Hardware Center',
			value: i % 7 === 0 ? -215.43 : -95.89,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 16)),
			categoryId: await getTransactionCategoryId(i % 2 === 0 ? 'Furnishings' : 'Home maintenance'),
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 5 === 0 ? 'ShortCircut Computers' : 'alphaStream',
			value: i % 5 === 0 ? -649.99 : -4.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 26)),
			categoryId: await getTransactionCategoryId(i % 5 === 0 ? 'Electronics' : 'Music'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'PurpleShield Health',
			value: -254.84,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 3)),
			categoryId: await getTransactionCategoryId('Health'),
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 7 === 0 ? 'Narby Warker' : "Stefano's Pizza by the Slice",
			value: i % 7 === 0 ? -150 : -7.78,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 13)),
			categoryId: await getTransactionCategoryId(i % 7 === 0 ? 'Health' : 'Restaurants'),
			isExcluded: false,
			isPending: false
		},
		{
			description: i % 9 === 0 ? '9-5 Office Supplies' : 'Flix Movie Rentals',
			value: i % 9 === 0 ? -98.23 : -4.99,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 13)),
			categoryId: await getTransactionCategoryId(
				i % 9 === 0 ? 'Office supplies' : 'Entertainment & recreation'
			),
			isExcluded: false,
			isPending: false
		},
		{
			description:
				i % 11 === 0 ? 'Horizon Wireless (Promotional Rebate)' : 'Juggernaut Cash Back Redemption',
			value: i % 11 === 0 ? 445 : 25.33,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 15)),
			categoryId: await getTransactionCategoryId(
				i % 11 === 0 ? 'Internet & phone' : 'Financial & banking'
			),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Ransack Bank Payment Received — Thank You',
			value: i % 3 === 0 ? 1755 : i % 6 === 0 ? 2355 : i % 9 === 0 ? 1945 : 1675,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 8)),
			categoryId: await getTransactionCategoryId('Payments'),
			isExcluded: false,
			isPending: false
		},
		{
			description: 'Juggernaut Visa Interest',
			value: -56.89,
			date: dateInUTC(addDays(startOfMonth(subMonths(new Date(), i)), 8)),
			categoryId: await getTransactionCategoryId('Fees'),
			isExcluded: false,
			isPending: false
		}
	];

	let transactions = await transactionSet(0);
	for (let i = 1; i < MONTHS_IN_SET; i++) {
		transactions = transactions.concat(await transactionSet(i));
	}

	return transactions;
};
