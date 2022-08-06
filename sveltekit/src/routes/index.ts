import {
	isAfter,
	isBefore,
	sub,
	eachMonthOfInterval,
	isEqual,
	endOfMonth,
	getUnixTime
} from 'date-fns';

import prisma from '$lib/helpers/prismaClient';
import {
	getBalanceGroupLabel,
	SortOrder,
	BalanceGroup,
	TrailingCashflowPeriods
} from '$lib/helpers/constants';
import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models';
import { proportionBetween, sortByKey } from '$lib/helpers/misc';

let cashflow: Cashflow;

export const GET = async () => {
	cashflow = await getCashflow();
	return {
		body: {
			summary: await getSummary(),
			cashflow,
			trailingCashflow: await getTrailingCashflow()
		}
	};
};

// Summary

interface BigPictureBalanceGroup {
	id: BalanceGroup;
	label: string;
	currentBalance: number;
}

export interface BigPictureSummary {
	netWorth: number;
	balanceGroups: BigPictureBalanceGroup[];
}

const getSummary = async () => {
	// Get Accounts and Assets
	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();
	const balanceItems = [...accounts, ...assets];

	const bigPictureBalanceGroups: BigPictureBalanceGroup[] = [];

	for (const balanceItem of balanceItems) {
		const currentBalance =
			'accountTypeId' in balanceItem // It's an Account if has the property `accountType`
				? await getAccountCurrentBalance(balanceItem)
				: await getAssetCurrentBalance(balanceItem);

		// Skip `balanceItems` with a `currentBalance` of 0
		if (currentBalance === 0) continue;

		// Find existing balanceGroup
		const { balanceGroup } = balanceItem;
		const bigPictureBalanceGroup = bigPictureBalanceGroups.find(({ id }) => id === balanceGroup);

		if (bigPictureBalanceGroup) {
			// Add currentBalance to existing group
			bigPictureBalanceGroup.currentBalance += currentBalance;
		} else {
			// Push new group
			bigPictureBalanceGroups.push({
				id: balanceGroup,
				label: getBalanceGroupLabel(balanceGroup),
				currentBalance
			});
		}
	}

	// Add balanceGroups with a balance of $0 for those without any balances
	const balanceGroups = Object.values(BalanceGroup).filter(
		(balanceGroup) => typeof balanceGroup === 'number'
	);
	for (const balanceGroup of balanceGroups) {
		if (!bigPictureBalanceGroups.find(({ id }) => id === balanceGroup)) {
			bigPictureBalanceGroups.push({
				id: balanceGroup as BalanceGroup,
				label: getBalanceGroupLabel(balanceGroup as BalanceGroup),
				currentBalance: 0
			});
		}
	}

	// Sort `balanceSheetBalanceGroups` by `balanceGroup`
	sortByKey(bigPictureBalanceGroups, 'id', SortOrder.DESC);

	return {
		// Calculate `netWorth` by the sum of all `balanceGroups` current balances
		netWorth: bigPictureBalanceGroups.reduce(
			(sum, { currentBalance }) => (sum += currentBalance),
			0
		),
		balanceGroups: bigPictureBalanceGroups
	};
};

// Cashflow

export interface PeriodCashflow {
	id: number;
	month: number;
	income: number;
	expenses: number;
	surplus: number;
	chartRatio: number;
}

interface CashflowChart {
	positiveRatio: number;
	negativeRatio: number;
	highestSurplus: number;
	lowestSurplus: number;
}

export interface Cashflow {
	periods: PeriodCashflow[];
	chart: CashflowChart;
}

const getCashflow = async (): Promise<Cashflow> => {
	// Get all transactions in the last 12 months (except for excluded ones)
	const transactions = await prisma.transaction.findMany({
		where: {
			date: {
				lte: new Date(),
				gte: sub(new Date(), { months: 11 })
			},
			isExcluded: false
		},
		select: {
			date: true,
			value: true
		},
		orderBy: {
			date: 'desc'
		}
	});

	// Don't continue if there are no transactions
	if (transactions.length === 0)
		return {
			periods: [],
			chart: { positiveRatio: 0, negativeRatio: 0, highestSurplus: 0, lowestSurplus: 0 }
		};

	const monthsInPeriod = eachMonthOfInterval({
		start: transactions[transactions.length - 1].date,
		end: new Date()
	});

	const getTransactionsInPeriod = (
		transactions: TransactionForCashflow[],
		from: Date,
		to: Date
	) => {
		return transactions.filter(
			(transaction) =>
				(isBefore(from, transaction.date) || isEqual(from, transaction.date)) &&
				isAfter(to, transaction.date)
		);
	};

	// Strip timezone from date and set to UTC
	const dateInUTC = (date: Date) => {
		return new Date(
			Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0)
		);
	};

	// Get the income, expense and surplus totals for each month
	let cashflowPeriods = monthsInPeriod.reduce((acc: PeriodCashflow[], month, id) => {
		const transactionsInPeriod = getTransactionsInPeriod(
			transactions,
			dateInUTC(month),
			monthsInPeriod[id + 1] ? dateInUTC(monthsInPeriod[id + 1]) : dateInUTC(endOfMonth(new Date()))
		);

		const income = transactionsInPeriod.reduce(
			(acc, { value }) => (value > 0 ? value + acc : acc),
			0
		);
		const expenses = transactionsInPeriod.reduce(
			(acc, { value }) => (value < 0 ? value + acc : acc),
			0
		);
		const surplus = expenses + income;

		return [
			...acc,
			{
				id,
				// Would love to pass the Date object as-is but the return gets serialized to JSON
				// so Dates are converted to string. So instead, we convert the month to a Unix timestamp.
				month: getUnixTime(month),
				income,
				expenses,
				surplus,
				chartRatio: 0
			}
		];
	}, []);

	// Get the highest positive surplus
	const highestSurplus = cashflowPeriods
		.filter(({ surplus }) => surplus > 0)
		.sort((a, b) => b.surplus - a.surplus)[0].surplus;

	// Get the lowest negative surplus
	const lowestSurplus = Math.abs(
		cashflowPeriods.filter(({ surplus }) => surplus < 0).sort((a, b) => a.surplus - b.surplus)[0]
			.surplus
	);

	const surplusRange = highestSurplus + lowestSurplus;
	const positiveRatio = proportionBetween(highestSurplus, surplusRange);
	const negativeRatio = proportionBetween(lowestSurplus, surplusRange);

	// Update the chartRatio for each period
	cashflowPeriods = cashflowPeriods.map((cashflowPeriod) => {
		const chartRatio =
			cashflowPeriod.surplus > 0
				? proportionBetween(cashflowPeriod.surplus, highestSurplus)
				: proportionBetween(Math.abs(cashflowPeriod.surplus), lowestSurplus);

		return {
			...cashflowPeriod,
			chartRatio: chartRatio
		};
	});

	return {
		periods: cashflowPeriods,
		chart: { positiveRatio, negativeRatio, highestSurplus, lowestSurplus: lowestSurplus * -1 }
	};
};

// Trailing Cashflow

interface TransactionForCashflow {
	date: Date;
	value: number;
}

interface PeriodAverageCashflow {
	incomeAverage: number;
	expensesAverage: number;
	surplusAverage: number;
}

export interface TrailingCashflow {
	last6Months: PeriodAverageCashflow;
	last12Months: PeriodAverageCashflow;
}

// Calculate the trailing averages for the chosen period
const getTrailingCashflow = (): TrailingCashflow => {
	const getAverages = (period: TrailingCashflowPeriods) => {
		const cashflowPeriods = cashflow.periods;

		// Return zeroes if there are no cashflow periods
		if (cashflowPeriods.length === 0) {
			return {
				incomeAverage: 0,
				expensesAverage: 0,
				surplusAverage: 0
			};
		}

		const months = period === TrailingCashflowPeriods.LAST_6_MONTHS ? 6 : 12;
		const incomeAverage =
			cashflowPeriods.slice(0, months).reduce((acc, { income }) => income + acc, 0) / months;
		const expensesAverage =
			cashflowPeriods.slice(0, months).reduce((acc, { expenses }) => expenses + acc, 0) / months;
		const surplusAverage = expensesAverage + incomeAverage;

		return {
			incomeAverage,
			expensesAverage,
			surplusAverage
		};
	};

	const last6Months = getAverages(TrailingCashflowPeriods.LAST_6_MONTHS);
	const last12Months = getAverages(TrailingCashflowPeriods.LAST_12_MONTHS);

	return { last6Months, last12Months };
};
