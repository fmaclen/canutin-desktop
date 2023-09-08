import Values from 'values.js';
import prisma from '$lib/helpers/prisma.server';
import type { ChartDataset } from 'chart.js';

import {
	getAccountBalanceDateRange,
	getAccountCurrentBalance,
	getAssetBalanceDateRange,
	getAssetCurrentBalance
} from '$lib/helpers/models.server';
import {
	eachWeekOfInterval,
	isSameWeek,
	startOfYear,
	subMonths,
	subWeeks,
	subYears
} from 'date-fns';
import { BalanceGroup, SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';
import { setChartDatasetColor } from '$lib/helpers/charts';
import { startOfTheWeekAfter } from '$lib/helpers/charts';
import type { Account, Asset } from '@prisma/client';
import { growthPercentage, proportionBetween } from '../../lib/helpers/misc';

interface TrendGroup {
	title: BalanceGroup | 'Net worth';
	labels: string[];
	datasets: ChartDataset[];
	accounts: Account[] | null;
	assets: Asset[] | null;
}

interface TrendNetWorthTable {
	name: BalanceGroup | 'Net worth';
	currentBalance: number | null;
	balanceOneWeek: number | null;
	performanceOneWeek: number | null;
	balanceOneMonth: number | null;
	performanceOneMonth: number | null;
	balanceSixMonths: number | null;
	performanceSixMonths: number | null;
	balanceYearToDate: number | null;
	performanceYearToDate: number | null;
	balanceOneYear: number | null;
	performanceOneYear: number | null;
	balanceFiveYears: number | null;
	performanceFiveYears: number | null;
	balanceMax: number | null;
	performanceMax: number | null;
	allocation: number | null;
}

const netWorthTableEmpty = {
	currentBalance: null,
	balanceOneWeek: null,
	balanceOneMonth: null,
	balanceSixMonths: null,
	balanceYearToDate: null,
	balanceOneYear: null,
	balanceFiveYears: null,
	balanceMax: null,
	performanceOneWeek: null,
	performanceOneMonth: null,
	performanceSixMonths: null,
	performanceYearToDate: null,
	performanceOneYear: null,
	performanceFiveYears: null,
	performanceMax: null,
	allocation: null
};

const trendNetWorthTable: TrendNetWorthTable[] = [
	{ name: 'Net worth', ...netWorthTableEmpty },
	{ name: BalanceGroup.CASH, ...netWorthTableEmpty },
	{ name: BalanceGroup.DEBT, ...netWorthTableEmpty },
	{ name: BalanceGroup.INVESTMENTS, ...netWorthTableEmpty },
	{ name: BalanceGroup.OTHER_ASSETS, ...netWorthTableEmpty }
];

const getDatasetLabels = async (accounts: Account[] | null, assets: Asset[] | null) => {
	const labels: string[] = [];
	const earliestBalanceDates: Date[] = [];

	if (accounts) {
		for (const account of accounts) {
			const { periodStart } = await getAccountBalanceDateRange(account);
			if (periodStart) earliestBalanceDates.push(periodStart);
		}
	}
	if (assets) {
		for (const asset of assets) {
			const { periodStart } = await getAssetBalanceDateRange(asset);
			if (periodStart) earliestBalanceDates.push(periodStart);
		}
	}

	// Get the earliest date of all the accounts and/or assets balances
	earliestBalanceDates.sort((a, b) => (a > b ? 1 : -1));
	const weeksInPeriod = eachWeekOfInterval({
		start: startOfTheWeekAfter(earliestBalanceDates[0]),
		end: startOfTheWeekAfter(new Date())
	});
	for (const weekInPeriod of weeksInPeriod) {
		labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
	}

	return labels;
};

// Generates an skeleton dataset for each Chart to be shown while we load the rest of the data
const generateEmptyDataset = (accounts: Account[] | null, assets: Asset[] | null) => {
	const datasets: ChartDataset[] = [];

	if (accounts) {
		for (const account of accounts) {
			datasets.push({ label: account.name, data: [] });
		}
	}
	if (assets) {
		for (const asset of assets) {
			datasets.push({ label: asset.name, data: [] });
		}
	}

	return datasets;
};

export const load = async () => {
	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();

	const trendCashAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.CASH); // prettier-ignore
	const trendCashAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.CASH); // prettier-ignore
	const trendCashLabels = await getDatasetLabels(trendCashAccounts, trendCashAssets); // prettier-ignore
	const trendCash: TrendGroup = {
		title: BalanceGroup.CASH,
		labels: trendCashLabels,
		accounts: trendCashAccounts,
		assets: trendCashAssets,
		datasets: generateEmptyDataset(trendCashAccounts, trendCashAssets)
	};

	const trendDebtAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtLabels = await getDatasetLabels(trendDebtAccounts, trendDebtAssets); // prettier-ignore
	const trendDebt: TrendGroup = {
		title: BalanceGroup.DEBT,
		labels: trendDebtLabels,
		accounts: trendDebtAccounts,
		assets: trendDebtAssets,
		datasets: generateEmptyDataset(trendDebtAccounts, trendDebtAssets)
	};

	const trendInvestmentsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsLabels = await getDatasetLabels(trendInvestmentsAccounts, trendInvestmentsAssets); // prettier-ignore
	const trendInvestments: TrendGroup = {
		title: BalanceGroup.INVESTMENTS,
		labels: trendInvestmentsLabels,
		accounts: trendInvestmentsAccounts,
		assets: trendInvestmentsAssets,
		datasets: generateEmptyDataset(trendInvestmentsAccounts, trendInvestmentsAssets)
	};

	const trendOtherAssetsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsLabels = await getDatasetLabels(trendOtherAssetsAccounts, trendOtherAssetsAssets); // prettier-ignore
	const trendOtherAssets: TrendGroup = {
		title: BalanceGroup.OTHER_ASSETS,
		labels: trendOtherAssetsLabels,
		accounts: trendOtherAssetsAccounts,
		assets: trendOtherAssetsAssets,
		datasets: generateEmptyDataset(trendOtherAssetsAccounts, trendOtherAssetsAssets)
	};

	const trendNetWorthLabels = await getDatasetLabels(accounts, assets);
	const trendNetWorth: TrendGroup = {
		title: 'Net worth',
		labels: trendNetWorthLabels,
		datasets: [
			{
				label: 'Net worth',
				data: []
			},
			{
				label: getBalanceGroupLabel(BalanceGroup.CASH),
				data: []
			},
			{
				label: getBalanceGroupLabel(BalanceGroup.DEBT),
				data: []
			},
			{
				label: getBalanceGroupLabel(BalanceGroup.INVESTMENTS),
				data: []
			},
			{
				label: getBalanceGroupLabel(BalanceGroup.OTHER_ASSETS),
				data: []
			}
		],
		accounts: accounts,
		assets: assets
	};
	trendNetWorth.datasets.forEach((dataset) => {
		switch (dataset.label) {
			case 'Net worth':
				setChartDatasetColor(dataset);
				break;
			case 'Cash':
				setChartDatasetColor(dataset, BalanceGroup.CASH);
				break;
			case 'Debt':
				setChartDatasetColor(dataset, BalanceGroup.DEBT);
				break;
			case 'Investments':
				setChartDatasetColor(dataset, BalanceGroup.INVESTMENTS);
				break;
			case 'Other assets':
				setChartDatasetColor(dataset, BalanceGroup.OTHER_ASSETS);
				break;
		}
	});

	const updateDatasetBalance = (
		datasets: ChartDataset[],
		label: string,
		balance: number | null
	) => {
		const currentDataset = datasets.find((dataset) => dataset.label === label);
		if (currentDataset) currentDataset.data.push(balance);
	};

	const updateDataset = async (
		datasets: ChartDataset[],
		weeksInPeriod: string[],
		accounts: Account[],
		assets: Asset[],
		color?: string,
		orderBy?: SortOrder
	): Promise<ChartDataset[]> => {
		const updatedDatasets: ChartDataset[] = structuredClone(datasets);

		for (const weekInPeriod of weeksInPeriod) {
			for (const account of accounts) {
				const balance = await getAccountCurrentBalance(account, new Date(weekInPeriod));
				updateDatasetBalance(updatedDatasets, account.name, balance);
			}

			for (const asset of assets) {
				const balance = await getAssetCurrentBalance(asset, new Date(weekInPeriod));
				updateDatasetBalance(updatedDatasets, asset.name, balance);
			}
		}

		// For Charts with a color set we apply a shade of that color to each dataset
		if (color) {
			updatedDatasets.sort((a, b) => {
				const aLastValue = (a.data[a.data.length - 1] || 0) as number;
				const bLastValue = (b.data[b.data.length - 1] || 0) as number;
				// NOTE: in the case of `trendDebtDataset` the sort order is reversed.
				return orderBy === SortOrder.ASC ? bLastValue - aLastValue : aLastValue - bLastValue;
			});
			const COLOR_WEIGHT = 125;
			updatedDatasets.forEach((updatedDataset, i) => {
				const itemColor = new Values(color)
					.all(COLOR_WEIGHT / updatedDatasets.length)
					[i].hexString();
				updatedDataset.backgroundColor = itemColor;
				updatedDataset.borderColor = itemColor;
			});
		}

		return updatedDatasets;
	};

	const trendCashDataset = updateDataset(
		trendCash.datasets,
		trendCashLabels,
		trendCashAccounts,
		trendCashAssets,
		'#00A36F' // var(--color-greenPrimary)
	);
	const trendDebtDataset = updateDataset(
		trendDebt.datasets,
		trendDebtLabels,
		trendDebtAccounts,
		trendDebtAssets,
		'#e75258', // var(--color-redPrimary)
		SortOrder.ASC
	);
	const trendInvestmentsDataset = updateDataset(
		trendInvestments.datasets,
		trendInvestmentsLabels,
		trendInvestmentsAccounts,
		trendInvestmentsAssets,
		'#B19B70' // var(--color-goldPrimary)
	);
	const trendOtherAssetsDataset = updateDataset(
		trendOtherAssets.datasets,
		trendOtherAssetsLabels,
		trendOtherAssetsAccounts,
		trendOtherAssetsAssets,
		'#5255AC' // var(--color-purplePrimary)
	);

	// The "Net worth" chart is special because it's an aggregate of all the other datasets
	const updateNetWorthDataset = async (): Promise<ChartDataset[]> => {
		const updatedDatasets: ChartDataset[] = structuredClone(trendNetWorth.datasets);
		const weeksInPeriod = trendNetWorthLabels;

		for (const weekInPeriod of weeksInPeriod) {
			const cashDataIndex = trendCashLabels.indexOf(weekInPeriod);
			const debtDataIndex = trendDebtLabels.indexOf(weekInPeriod);
			const investmentsDataIndex = trendInvestmentsLabels.indexOf(weekInPeriod);
			const otherAssetsDataIndex = trendOtherAssetsLabels.indexOf(weekInPeriod);

			const hasCashBalance = cashDataIndex !== -1;
			const hasDebtBalance = debtDataIndex !== -1;
			const hasInvestmentsBalance = investmentsDataIndex !== -1;
			const hasOtherAssetsBalance = otherAssetsDataIndex !== -1;

			let netWorthBalance = 0;
			let cashBalance = 0;
			let debtBalance = 0;
			let investmentsBalance = 0;
			let otherAssetsBalance = 0;

			if (hasCashBalance) {
				(await trendCashDataset).forEach((dataset) => {
					cashBalance += dataset.data[cashDataIndex] as number;
					netWorthBalance += dataset.data[cashDataIndex] as number;
				});
			}
			if (hasDebtBalance) {
				(await trendDebtDataset).forEach((dataset) => {
					debtBalance += dataset.data[debtDataIndex] as number;
					netWorthBalance += dataset.data[debtDataIndex] as number;
				});
			}
			if (hasInvestmentsBalance) {
				(await trendInvestmentsDataset).forEach((dataset) => {
					investmentsBalance += dataset.data[investmentsDataIndex] as number;
					netWorthBalance += dataset.data[investmentsDataIndex] as number;
				});
			}
			if (hasOtherAssetsBalance) {
				(await trendOtherAssetsDataset).forEach((dataset) => {
					otherAssetsBalance += dataset.data[otherAssetsDataIndex] as number;
					netWorthBalance += dataset.data[otherAssetsDataIndex] as number;
				});
			}

			updateDatasetBalance(updatedDatasets, 'Cash', hasCashBalance ? cashBalance : null);
			updateDatasetBalance(updatedDatasets, 'Debt', hasDebtBalance ? debtBalance : null);
			updateDatasetBalance(updatedDatasets, 'Investments', hasInvestmentsBalance ? investmentsBalance : null); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Other assets', hasOtherAssetsBalance ? otherAssetsBalance : null); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Net worth', netWorthBalance);
		}

		return updatedDatasets;
	};
	const trendNetWorthDataset = updateNetWorthDataset();

	const updateNetWorthTable = async (): Promise<TrendNetWorthTable[]> => {
		const today = new Date();
		const oneWeekAgo = subWeeks(today, 1);
		const oneMonthAgo = subMonths(today, 1);
		const sixMonthsAgo = subMonths(today, 6);
		const firstOfCurrentYear = startOfYear(today);
		const oneYearAgo = subYears(today, 1);
		const fiveYearsAgo = subYears(today, 5);
		const weeksInPeriod = trendNetWorthLabels;

		const datasets = await trendNetWorthDataset;
		const netWorthDataset = datasets.find(({ label }) => label === 'Net worth')?.data as number[]; // prettier-ignore
		const cashDataset = datasets.find(({ label }) => label === 'Cash')?.data as number[]; // prettier-ignore
		const debtDataset = datasets.find(({ label }) => label === 'Debt')?.data as number[]; // prettier-ignore
		const investmentsDataset = datasets.find(({ label }) => label === 'Investments')?.data as number[]; // prettier-ignore
		const otherAssetsDataset = datasets.find(({ label }) => label === 'Other assets')?.data as number[]; // prettier-ignore

		const rowNetWorth = trendNetWorthTable.find(({ name }) => name === 'Net worth') as TrendNetWorthTable; // prettier-ignore
		const rowCash = trendNetWorthTable.find(({ name }) => name === BalanceGroup.CASH) as TrendNetWorthTable; // prettier-ignore
		const rowDebt = trendNetWorthTable.find(({ name }) => name === BalanceGroup.DEBT) as TrendNetWorthTable; // prettier-ignore
		const rowInvestments = trendNetWorthTable.find(({ name }) => name === BalanceGroup.INVESTMENTS) as TrendNetWorthTable; // prettier-ignore
		const rowOtherAssets = trendNetWorthTable.find(({ name }) => name === BalanceGroup.OTHER_ASSETS) as TrendNetWorthTable; // prettier-ignore

		for (const weekInPeriod of weeksInPeriod) {
			const currentWeek = new Date(weekInPeriod);
			const netWorthPeriod = netWorthDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const cashPeriod = cashDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const debtPeriod = debtDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const investmentsPeriod = investmentsDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const otherAssetsPeriod = otherAssetsDataset[weeksInPeriod.indexOf(weekInPeriod)];

			if (isSameWeek(currentWeek, new Date(weeksInPeriod[0]))) {
				rowNetWorth.balanceMax = netWorthPeriod;
				rowCash.balanceMax = cashDataset.find((balance) => balance !== null) || null;
				rowDebt.balanceMax = debtDataset.find((balance) => balance !== null) || null;
				rowInvestments.balanceMax = investmentsDataset.find((balance) => balance !== null) || null;
				rowOtherAssets.balanceMax = otherAssetsDataset.find((balance) => balance !== null) || null;
			}
			if (isSameWeek(currentWeek, oneWeekAgo)) {
				rowNetWorth.balanceOneWeek = netWorthPeriod;
				rowCash.balanceOneWeek = cashPeriod;
				rowDebt.balanceOneWeek = debtPeriod;
				rowInvestments.balanceOneWeek = investmentsPeriod;
				rowOtherAssets.balanceOneWeek = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, oneMonthAgo)) {
				rowNetWorth.balanceOneMonth = netWorthPeriod;
				rowCash.balanceOneMonth = cashPeriod;
				rowDebt.balanceOneMonth = debtPeriod;
				rowInvestments.balanceOneMonth = investmentsPeriod;
				rowOtherAssets.balanceOneMonth = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, sixMonthsAgo)) {
				rowNetWorth.balanceSixMonths = netWorthPeriod;
				rowCash.balanceSixMonths = cashPeriod;
				rowDebt.balanceSixMonths = debtPeriod;
				rowInvestments.balanceSixMonths = investmentsPeriod;
				rowOtherAssets.balanceSixMonths = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, firstOfCurrentYear)) {
				rowNetWorth.balanceYearToDate = netWorthPeriod;
				rowCash.balanceYearToDate = cashPeriod;
				rowDebt.balanceYearToDate = debtPeriod;
				rowInvestments.balanceYearToDate = investmentsPeriod;
				rowOtherAssets.balanceYearToDate = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, oneYearAgo)) {
				rowNetWorth.balanceOneYear = netWorthPeriod;
				rowCash.balanceOneYear = cashPeriod;
				rowDebt.balanceOneYear = debtPeriod;
				rowInvestments.balanceOneYear = investmentsPeriod;
				rowOtherAssets.balanceOneYear = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, fiveYearsAgo)) {
				rowNetWorth.balanceFiveYears = netWorthPeriod;
				rowCash.balanceFiveYears = cashPeriod;
				rowDebt.balanceFiveYears = debtPeriod;
				rowInvestments.balanceFiveYears = investmentsPeriod;
				rowOtherAssets.balanceFiveYears = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, new Date(weeksInPeriod[weeksInPeriod.length - 1]))) {
				rowNetWorth.currentBalance = netWorthPeriod;
				rowCash.currentBalance = cashPeriod;
				rowDebt.currentBalance = debtPeriod;
				rowInvestments.currentBalance = investmentsPeriod;
				rowOtherAssets.currentBalance = otherAssetsPeriod;
				rowNetWorth.allocation = 100;
				rowCash.allocation = proportionBetween(cashPeriod, netWorthPeriod);
				rowDebt.allocation = proportionBetween(Math.abs(debtPeriod), netWorthPeriod);
				rowInvestments.allocation = proportionBetween(investmentsPeriod, netWorthPeriod);
				rowOtherAssets.allocation = proportionBetween(otherAssetsPeriod, netWorthPeriod);
			}
		}

		for (const trend of trendNetWorthTable) {
			const {
				balanceOneWeek,
				balanceOneMonth,
				balanceSixMonths,
				balanceYearToDate,
				balanceOneYear,
				balanceFiveYears,
				balanceMax,
				currentBalance
			} = trend;
			if (currentBalance === null) break;
			if (balanceOneWeek) trend.performanceOneWeek = growthPercentage(balanceOneWeek, currentBalance); // prettier-ignore
			if (balanceOneMonth) trend.performanceOneMonth = growthPercentage(balanceOneMonth, currentBalance); // prettier-ignore
			if (balanceSixMonths) trend.performanceSixMonths = growthPercentage(balanceSixMonths, currentBalance); // prettier-ignore
			if (balanceYearToDate) trend.performanceYearToDate = growthPercentage(balanceYearToDate, currentBalance); // prettier-ignore
			if (balanceOneYear) trend.performanceOneYear = growthPercentage(balanceOneYear, currentBalance); // prettier-ignore
			if (balanceFiveYears) trend.performanceFiveYears = growthPercentage(balanceFiveYears, currentBalance); // prettier-ignore
			if (balanceMax) trend.performanceMax = growthPercentage(balanceMax, currentBalance); // prettier-ignore
		}

		return trendNetWorthTable;
	};

	const trendNetWorthTableData = updateNetWorthTable();

	return {
		trendNetWorth,
		trendCash,
		trendDebt,
		trendInvestments,
		trendOtherAssets,
		trendNetWorthTable,
		streamed: {
			trendCashDataset,
			trendDebtDataset,
			trendInvestmentsDataset,
			trendOtherAssetsDataset,
			trendNetWorthDataset,
			trendNetWorthTableData
		}
	};
};
