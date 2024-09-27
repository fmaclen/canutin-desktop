<script lang="ts">
	import { eachMonthOfInterval, endOfMonth, isAfter, isBefore, isEqual, sub } from 'date-fns';

	import type { TransactionsResponse } from '$lib/pocketbase-types';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import { dateInUTC, proportionBetween } from '$lib/utils';

	interface PeriodCashflow {
		id: number;
		month: Date;
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

	interface Cashflow {
		periods: PeriodCashflow[];
		chart: CashflowChart;
	}

	interface PeriodAverageCashflow {
		incomeAverage: number;
		expensesAverage: number;
		surplusAverage: number;
	}

	interface TrailingCashflow {
		last6Months: PeriodAverageCashflow;
		last12Months: PeriodAverageCashflow;
	}

	// We want 13 periods, one for the current month and the 12 previous months
	const CASHFLOW_PERIODS = 13;
	const SIX_MONTHS = 6;
	const TWELVE_MONTHS = 12;

	const pbClient = getPbClientContext();
	const today = new Date();
	const monthsInPeriod = eachMonthOfInterval({
		start: sub(today, { months: CASHFLOW_PERIODS - 1 }),
		end: endOfMonth(today)
	});

	function zeroedCashflow(): Cashflow {
		const periods: PeriodCashflow[] = [];
		for (const [index, month] of monthsInPeriod.entries()) {
			periods.push({
				id: index,
				income: 0,
				expenses: 0,
				surplus: 0,
				month: dateInUTC(month),
				chartRatio: 0
			});
		}

		return {
			periods,
			chart: { positiveRatio: 0, negativeRatio: 0, highestSurplus: 0, lowestSurplus: 0 }
		};
	}

	async function getCashflow() {
		const transactions = await pbClient.pb.collection('transactions').getFullList({
			filter: `date >= "${monthsInPeriod[0].toISOString()}" && date <= "${monthsInPeriod[monthsInPeriod.length - 1].toISOString()}"`
		});

		const getTransactionsInPeriod = (
			transactions: TransactionsResponse[],
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
				monthsInPeriod[id + 1]
					? dateInUTC(monthsInPeriod[id + 1])
					: dateInUTC(endOfMonth(new Date()))
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
					month,
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

		cashflow = {
			periods: cashflowPeriods,
			chart: { positiveRatio, negativeRatio, highestSurplus, lowestSurplus }
		};
	}

	// Calculate the trailing averages for the chosen period
	function getTrailingCashflow(): TrailingCashflow {
		const getAverages = (period: number) => {
			const cashflowPeriods =
				period === SIX_MONTHS
					? cashflow?.periods.slice(SIX_MONTHS, TWELVE_MONTHS)
					: cashflow?.periods.slice(0, TWELVE_MONTHS);

			// Return zeroes if there are no cashflow periods
			if (!cashflowPeriods?.length) {
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
	}

	let cashflow: Cashflow = $state(zeroedCashflow());
	let trailingCashflow: TrailingCashflow = $derived.by(() => getTrailingCashflow());

	$effect(() => {
		getCashflow();
	});
</script>

<h3>Cashflow</h3>

{JSON.stringify(cashflow.periods)}

<h3>Trailing Cashflow</h3>

{JSON.stringify(trailingCashflow)}
