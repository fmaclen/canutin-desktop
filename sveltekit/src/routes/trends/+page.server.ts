import Values from 'values.js';
import prisma from '$lib/helpers/prisma.server';
import type { ChartDataset } from 'chart.js';

import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models.server';
import {
	eachWeekOfInterval,
	endOfWeek,
	isSameWeek,
	startOfWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears
} from 'date-fns';
import { BalanceGroup, SortOrder } from '$lib/helpers/constants';
import { setChartDatasetColor } from '$lib/helpers/charts';
import { handlePeriodEnd } from '$lib/helpers/charts';
import { percentageOf, proportionBetween } from '$lib/helpers/misc';

export const load = async () => {
	const labels: string[] = [];
	const datasetNetWorth: ChartDataset[] = [];
	const datasetCash: ChartDataset[] = [];
	const datasetDebt: ChartDataset[] = [];
	const datasetInvestments: ChartDataset[] = [];
	const datasetOtherAssets: ChartDataset[] = [];

	interface TableNetWorth {
		name: BalanceGroup | 'Net worth';
		currentBalance: number;
		balanceOneWeek: number;
		performanceOneWeek: number;
		balanceOneMonth: number;
		performanceOneMonth: number;
		balanceSixMonths: number;
		performanceSixMonths: number;
		balanceYearToDate: number;
		performanceYearToDate: number;
		balanceOneYear: number;
		performanceOneYear: number;
		balanceFiveYears: number;
		performanceFiveYears: number;
		balanceLifetime: number;
		performanceLifetime: number;
		allocation: number;
	}

	const performanceZeroes = {
		currentBalance: 0,
		balanceOneWeek: 0,
		balanceOneMonth: 0,
		balanceSixMonths: 0,
		balanceYearToDate: 0,
		balanceOneYear: 0,
		balanceFiveYears: 0,
		balanceLifetime: 0,
		performanceOneWeek: 0,
		performanceOneMonth: 0,
		performanceSixMonths: 0,
		performanceYearToDate: 0,
		performanceOneYear: 0,
		performanceFiveYears: 0,
		performanceLifetime: 0,
		allocation: 0
	};

	const tableNetWorth: TableNetWorth[] = [
		{ name: 'Net worth', ...performanceZeroes },
		{ name: BalanceGroup.CASH, ...performanceZeroes },
		{ name: BalanceGroup.DEBT, ...performanceZeroes },
		{ name: BalanceGroup.INVESTMENTS, ...performanceZeroes },
		{ name: BalanceGroup.OTHER_ASSETS, ...performanceZeroes }
	];

	const balanceToDataset = (label: string, balance: number, balanceGroup?: BalanceGroup) => {
		const itemData = { label, data: [balance] };

		// Find an existing dataset from it's label (or add it for the first time)
		const updateDataset = (dataset: ChartDataset[]) => {
			const currentDataset = dataset.find(({ label }) => label === itemData.label);
			currentDataset ? currentDataset.data.push(balance) : dataset.push(itemData);
		};

		switch (balanceGroup) {
			case BalanceGroup.CASH:
				updateDataset(datasetCash);
				break;
			case BalanceGroup.DEBT:
				updateDataset(datasetDebt);
				break;
			case BalanceGroup.INVESTMENTS:
				updateDataset(datasetInvestments);
				break;
			case BalanceGroup.OTHER_ASSETS:
				updateDataset(datasetOtherAssets);
				break;
			default:
				updateDataset(datasetNetWorth);
		}
	};

	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();

	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////

	const earliestBalanceDates: Date[] = [];
	for (const account of accounts) {
		let earliestBalance;
		if (account.isAutoCalculated) {
			earliestBalance = await prisma.transaction.findFirst({
				where: { accountId: account.id },
				orderBy: { date: SortOrder.ASC }
			});
		} else {
			earliestBalance = await prisma.accountBalanceStatement.findFirst({
				where: { accountId: account.id },
				orderBy: { createdAt: SortOrder.ASC }
			});
		}
		if (earliestBalance) earliestBalanceDates.push(earliestBalance.createdAt);
	}

	for (const asset of assets) {
		const earliestBalance = await prisma.assetBalanceStatement.findFirst({
			where: { assetId: asset.id },
			orderBy: { createdAt: SortOrder.ASC }
		});
		if (earliestBalance) earliestBalanceDates.push(earliestBalance.createdAt);
	}

	earliestBalanceDates.sort((a, b) => (a > b ? 1 : -1));

	const today = new Date();
	const endOfThisWeek = endOfWeek(today);
	const oneWeekAgo = subWeeks(today, 1);
	const oneMonthAgo = subMonths(today, 1);
	const sixMonthsAgo = subMonths(today, 6);
	const firstOfCurrentYear = startOfYear(today);
	const oneYearAgo = subYears(today, 1);
	const fiveYearsAgo = subYears(today, 5);
	const weeksInPeriod = eachWeekOfInterval({
		start: startOfWeek(earliestBalanceDates[0]),
		end: handlePeriodEnd(endOfThisWeek)
	});

	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////

	for (const weekInPeriod of weeksInPeriod) {
		labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31

		let netWorthPeriod = 0;
		let cashPeriod = 0;
		let debtPeriod = 0;
		let investmentsPeriod = 0;
		let otherAssetsPeriod = 0;

		// Calculates balances of balance groups and net worth so they can be added as separate datasets
		const balanceToBalanceGroupDataset = (balanceGroup: BalanceGroup, balance: number) => {
			switch (balanceGroup) {
				case BalanceGroup.CASH:
					cashPeriod += balance;
					break;
				case BalanceGroup.DEBT:
					debtPeriod += balance;
					break;
				case BalanceGroup.INVESTMENTS:
					investmentsPeriod += balance;
					break;
				case BalanceGroup.OTHER_ASSETS:
					otherAssetsPeriod += balance;
			}
			netWorthPeriod = netWorthPeriod + balance;
		};

		for (const account of accounts) {
			const { name, balanceGroup } = account;
			const balance = await getAccountCurrentBalance(account, weekInPeriod);
			balanceToDataset(name, balance, balanceGroup);
			balanceToBalanceGroupDataset(balanceGroup, balance);
		}

		for (const asset of assets) {
			const { name, balanceGroup } = asset;
			const balance = await getAssetCurrentBalance(asset, weekInPeriod);
			balanceToDataset(name, balance, balanceGroup);
			balanceToBalanceGroupDataset(balanceGroup, balance);
		}

		balanceToDataset('Net worth', netWorthPeriod);
		balanceToDataset('Cash', cashPeriod);
		balanceToDataset('Debt', debtPeriod);
		balanceToDataset('Investments', investmentsPeriod);
		balanceToDataset('Other assets', otherAssetsPeriod);

		////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////

		if (isSameWeek(weekInPeriod, weeksInPeriod[0])) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceLifetime = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceLifetime = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceLifetime = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceLifetime = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceLifetime = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, oneWeekAgo)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceOneWeek = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceOneWeek = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceOneWeek = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceOneWeek = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceOneWeek = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, oneMonthAgo)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceOneMonth = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceOneMonth = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceOneMonth = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceOneMonth = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceOneMonth = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, sixMonthsAgo)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceSixMonths = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceSixMonths = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceSixMonths = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceSixMonths = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceSixMonths = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, firstOfCurrentYear)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceYearToDate = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceYearToDate = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceYearToDate = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceYearToDate = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceYearToDate = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, oneYearAgo)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceOneYear = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceOneYear = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceOneYear = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceOneYear = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceOneYear = otherAssetsPeriod; // prettier-ignore
		}
		if (isSameWeek(weekInPeriod, fiveYearsAgo)) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).balanceFiveYears = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).balanceFiveYears = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).balanceFiveYears = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).balanceFiveYears = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).balanceFiveYears = otherAssetsPeriod; // prettier-ignore
		}
		if (weekInPeriod === weeksInPeriod[weeksInPeriod.length - 1]) {
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).currentBalance = netWorthPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === 'Net worth') as TableNetWorth).allocation = 100; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).currentBalance = cashPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.CASH) as TableNetWorth).allocation = proportionBetween(cashPeriod, netWorthPeriod); // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).currentBalance = debtPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.DEBT) as TableNetWorth).allocation = proportionBetween(Math.abs(debtPeriod), netWorthPeriod); // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).currentBalance = investmentsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TableNetWorth).allocation = proportionBetween(investmentsPeriod, netWorthPeriod); // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).currentBalance = otherAssetsPeriod; // prettier-ignore
			(tableNetWorth.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TableNetWorth).allocation = proportionBetween(otherAssetsPeriod, netWorthPeriod); // prettier-ignore
		}
	}

	for (const performance in tableNetWorth) {
		const performanceItem = tableNetWorth[performance];
		performanceItem.performanceOneWeek = percentageOf(
			performanceItem.balanceOneWeek,
			performanceItem.currentBalance
		);
		performanceItem.performanceOneMonth = percentageOf(
			performanceItem.balanceOneMonth,
			performanceItem.currentBalance
		);
		performanceItem.performanceSixMonths = percentageOf(
			performanceItem.balanceSixMonths,
			performanceItem.currentBalance
		);
		performanceItem.performanceYearToDate = percentageOf(
			performanceItem.balanceYearToDate,
			performanceItem.currentBalance
		);
		performanceItem.performanceOneYear = percentageOf(
			performanceItem.balanceOneYear,
			performanceItem.currentBalance
		);
		performanceItem.performanceFiveYears = percentageOf(
			performanceItem.balanceFiveYears,
			performanceItem.currentBalance
		);
		performanceItem.performanceLifetime = percentageOf(
			performanceItem.balanceLifetime,
			performanceItem.currentBalance
		);
	}

	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////

	// Generate shades of a given color for each dataset
	const COLOR_WEIGHT = 125;
	const setShadedBorderColor = (
		chartDatasets: ChartDataset[],
		color: string,
		orderBy?: SortOrder
	) => {
		// Before setting a border color we need to sort the dataset in a meaningul way.
		// Because values can vary a lot, we choose to sort by the most recent value in the dataset.
		chartDatasets.sort((a, b) => {
			const aLastValue = (a.data[a.data.length - 1] || 0) as number;
			const bLastValue = (b.data[b.data.length - 1] || 0) as number;

			// NOTE: in the case of `chartDebt` the sort order is reversed.
			return orderBy === SortOrder.ASC ? bLastValue - aLastValue : aLastValue - bLastValue;
		});

		chartDatasets.forEach((chartDataset, i) => {
			const itemColor = new Values(color).all(COLOR_WEIGHT / chartDatasets.length)[i].hexString();
			chartDataset.backgroundColor = itemColor;
			chartDataset.borderColor = itemColor;
		});
	};

	setShadedBorderColor(datasetCash, '#00A36F'); // var(--color-greenPrimary)
	setShadedBorderColor(datasetDebt, '#e75258', SortOrder.ASC); // var(--color-redPrimary)
	setShadedBorderColor(datasetInvestments, '#B19B70'); // var(--color-goldPrimary)
	setShadedBorderColor(datasetOtherAssets, '#5255AC'); // var(--color-purplePrimary)

	datasetNetWorth.forEach((chartDataset) => {
		switch (chartDataset.label) {
			case 'Net worth':
				setChartDatasetColor(chartDataset);
				break;
			case 'Cash':
				setChartDatasetColor(chartDataset, BalanceGroup.CASH);
				break;
			case 'Debt':
				setChartDatasetColor(chartDataset, BalanceGroup.DEBT);
				break;
			case 'Investments':
				setChartDatasetColor(chartDataset, BalanceGroup.INVESTMENTS);
				break;
			case 'Other assets':
				setChartDatasetColor(chartDataset, BalanceGroup.OTHER_ASSETS);
				break;
		}
	});

	return {
		labels,
		datasetNetWorth,
		datasetCash,
		datasetDebt,
		datasetInvestments,
		datasetOtherAssets,
		tableNetWorth
	};
};
