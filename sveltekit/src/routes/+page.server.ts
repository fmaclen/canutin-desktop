import {
	isAfter,
	isBefore,
	sub,
	eachMonthOfInterval,
	isEqual,
	endOfMonth,
	getUnixTime
} from 'date-fns';

import prisma from '$lib/helpers/prisma';
import { getBalanceGroupLabel, SortOrder, BalanceGroup } from '$lib/helpers/constants';
import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models';
import { dateInUTC, proportionBetween, sortByKey } from '$lib/helpers/misc';

export const load = async () => {
	const summary = await getSummary();
	const cashflow = await getCashflow();
	const trailingCashflow = getTrailingCashflow(cashflow);

	return {
		summary,
		cashflow,
		trailingCashflow
	};
};

// Summary ---------------------------------------------------------------------

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

// Cashflow --------------------------------------------------------------------

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
	// We want 13 periods, one for the current month and the 12 previous months
	const CASHFLOW_PERIODS = 13;

	const today = dateInUTC(new Date());
	const monthsInPeriod = eachMonthOfInterval({
		start: sub(today, { months: CASHFLOW_PERIODS - 1 }),
		end: endOfMonth(today)
	});

	// Get all transactions in the last 13 months (except for excluded ones)
	const transactions = await prisma.transaction.findMany({
		where: {
			date: {
				lte: endOfMonth(today),
				gte: sub(today, { months: CASHFLOW_PERIODS })
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

	// If there are no transactions we return zeroed cashflow periods
	if (transactions.length === 0) {
		const periods: PeriodCashflow[] = [];
		for (const [index, month] of monthsInPeriod.entries()) {
			periods.push({
				id: index,
				income: 0,
				expenses: 0,
				surplus: 0,
				month: getUnixTime(month),
				chartRatio: 0
			});
		}

		return {
			periods,
			chart: { positiveRatio: 0, negativeRatio: 0, highestSurplus: 0, lowestSurplus: 0 }
		};
	}

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
				income,
				expenses,
				surplus,

				// Would love to pass the Date object as-is but the endpoint returns a serialized JSON
				// so Dates are converted to string. Instead, we convert the month to a Unix timestamp.
				month: getUnixTime(month),

				// We don't know the value of `chartRatio` at this point so we set it to 0.
				// It will be overwriten later after we get the `highestSurplus` and `lowestSurplus`.
				chartRatio: 0
			}
		];
	}, []);

	// Get the highest positive surplus
	const positiveSurplusPeriods = cashflowPeriods.filter(({ surplus }) => surplus > 0);
	const highestSurplus =
		positiveSurplusPeriods.length > 0
			? positiveSurplusPeriods.sort((a, b) => b.surplus - a.surplus)[0].surplus
			: 0;

	// Get the lowest negative surplus
	const negativeSurplusPeriods = cashflowPeriods.filter(({ surplus }) => surplus < 0);
	const lowestSurplus =
		negativeSurplusPeriods.length > 0
			? negativeSurplusPeriods.sort((a, b) => a.surplus - b.surplus)[0].surplus
			: 0;

	const surplusRange = highestSurplus + Math.abs(lowestSurplus);
	let positiveRatio = proportionBetween(highestSurplus, surplusRange);
	let negativeRatio = proportionBetween(Math.abs(lowestSurplus), surplusRange);

	if (positiveRatio > negativeRatio) {
		const isNegativeRatioZero = negativeRatio === 0;
		positiveRatio = isNegativeRatioZero ? 1 : positiveRatio / negativeRatio;
		negativeRatio = isNegativeRatioZero ? 0 : 1;
	} else {
		const isPositiveRatioZero = positiveRatio === 0;
		negativeRatio = isPositiveRatioZero ? 1 : negativeRatio / positiveRatio;
		positiveRatio = isPositiveRatioZero ? 0 : 1;
	}

	// Update the chartRatio for each period
	cashflowPeriods = cashflowPeriods.map((cashflowPeriod) => {
		const chartRatio =
			cashflowPeriod.surplus > 0
				? proportionBetween(cashflowPeriod.surplus, highestSurplus)
				: proportionBetween(Math.abs(cashflowPeriod.surplus), Math.abs(lowestSurplus));

		return {
			...cashflowPeriod,
			chartRatio: chartRatio
		};
	});

	return {
		periods: cashflowPeriods,
		chart: { positiveRatio, negativeRatio, highestSurplus, lowestSurplus }
	};
};

// Trailing Cashflow -----------------------------------------------------------

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
const getTrailingCashflow = (cashflow: Cashflow): TrailingCashflow => {
	const SIX_MONTHS = 6;
	const TWELVE_MONTHS = 12;

	const getAverages = (period: number) => {
		const cashflowPeriods =
			period === SIX_MONTHS
				? cashflow.periods.slice(SIX_MONTHS, TWELVE_MONTHS)
				: cashflow.periods.slice(0, TWELVE_MONTHS);

		// Return zeroes if there are no cashflow periods
		if (cashflowPeriods.length === 0) {
			return {
				incomeAverage: 0,
				expensesAverage: 0,
				surplusAverage: 0
			};
		}

		const incomeAverage = cashflowPeriods.reduce((acc, { income }) => income + acc, 0) / period;
		const expensesAverage =
			cashflowPeriods.reduce((acc, { expenses }) => expenses + acc, 0) / period;
		const surplusAverage = expensesAverage + incomeAverage;

		return {
			incomeAverage,
			expensesAverage,
			surplusAverage
		};
	};

	return { last6Months: getAverages(SIX_MONTHS), last12Months: getAverages(TWELVE_MONTHS) };
};
