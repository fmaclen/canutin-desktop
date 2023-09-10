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
import { dateInUTC, growthPercentage, proportionBetween } from '$lib/helpers/misc';
import type { Account, Asset } from '@prisma/client';

interface TrendGroup {
	title: string;
	labels: string[];
	datasets: ChartDataset[];
	accounts: Account[];
	assets: Asset[];
}

export interface TrendNetWorthTable {
	name: string;
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

const netWorthLabel = 'Net worth';
const cashLabel = getBalanceGroupLabel(BalanceGroup.CASH);
const debtLabel = getBalanceGroupLabel(BalanceGroup.DEBT);
const investmentsLabel = getBalanceGroupLabel(BalanceGroup.INVESTMENTS);
const otherAssetsLabel = getBalanceGroupLabel(BalanceGroup.OTHER_ASSETS);

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
	{ name: netWorthLabel, ...netWorthTableEmpty },
	{ name: cashLabel, ...netWorthTableEmpty },
	{ name: debtLabel, ...netWorthTableEmpty },
	{ name: investmentsLabel, ...netWorthTableEmpty },
	{ name: otherAssetsLabel, ...netWorthTableEmpty }
];

const getDatasetLabels = async (accounts: Account[], assets: Asset[]) => {
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

	if (earliestBalanceDates.length === 0) return labels;

	// Get the earliest date of all the accounts and/or assets balances
	earliestBalanceDates.sort((a, b) => (a > b ? 1 : -1));

	const weeksInPeriod = eachWeekOfInterval({
		start: dateInUTC(startOfTheWeekAfter(earliestBalanceDates[0])),
		end: dateInUTC(startOfTheWeekAfter(new Date()))
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
		title: cashLabel,
		labels: trendCashLabels,
		accounts: trendCashAccounts,
		assets: trendCashAssets,
		datasets: generateEmptyDataset(trendCashAccounts, trendCashAssets)
	};

	const trendDebtAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtLabels = await getDatasetLabels(trendDebtAccounts, trendDebtAssets); // prettier-ignore
	const trendDebt: TrendGroup = {
		title: debtLabel,
		labels: trendDebtLabels,
		accounts: trendDebtAccounts,
		assets: trendDebtAssets,
		datasets: generateEmptyDataset(trendDebtAccounts, trendDebtAssets)
	};

	const trendInvestmentsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsLabels = await getDatasetLabels(trendInvestmentsAccounts, trendInvestmentsAssets); // prettier-ignore
	const trendInvestments: TrendGroup = {
		title: investmentsLabel,
		labels: trendInvestmentsLabels,
		accounts: trendInvestmentsAccounts,
		assets: trendInvestmentsAssets,
		datasets: generateEmptyDataset(trendInvestmentsAccounts, trendInvestmentsAssets)
	};

	const trendOtherAssetsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsLabels = await getDatasetLabels(trendOtherAssetsAccounts, trendOtherAssetsAssets); // prettier-ignore
	const trendOtherAssets: TrendGroup = {
		title: otherAssetsLabel,
		labels: trendOtherAssetsLabels,
		accounts: trendOtherAssetsAccounts,
		assets: trendOtherAssetsAssets,
		datasets: generateEmptyDataset(trendOtherAssetsAccounts, trendOtherAssetsAssets)
	};

	const trendNetWorthLabels = await getDatasetLabels(accounts, assets);
	const trendNetWorth: TrendGroup = {
		title: netWorthLabel,
		labels: trendNetWorthLabels,
		datasets: [
			{
				label: netWorthLabel,
				data: []
			},
			{
				label: cashLabel,
				data: []
			},
			{
				label: debtLabel,
				data: []
			},
			{
				label: investmentsLabel,
				data: []
			},
			{
				label: otherAssetsLabel,
				data: []
			}
		],
		accounts: accounts,
		assets: assets
	};
	trendNetWorth.datasets.forEach((dataset) => {
		switch (dataset.label) {
			case netWorthLabel:
				setChartDatasetColor(dataset);
				break;
			case cashLabel:
				setChartDatasetColor(dataset, BalanceGroup.CASH);
				break;
			case debtLabel:
				setChartDatasetColor(dataset, BalanceGroup.DEBT);
				break;
			case investmentsLabel:
				setChartDatasetColor(dataset, BalanceGroup.INVESTMENTS);
				break;
			case otherAssetsLabel:
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
			const currentWeek = dateInUTC(new Date(weekInPeriod));

			for (const account of accounts) {
				const balance = await getAccountCurrentBalance(account, currentWeek);
				updateDatasetBalance(updatedDatasets, account.name, balance);
			}

			for (const asset of assets) {
				const balance = await getAssetCurrentBalance(asset, currentWeek);
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
			console.warn('otherAssetsDataIndex', otherAssetsDataIndex, weekInPeriod);

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

			updateDatasetBalance(updatedDatasets, cashLabel, hasCashBalance ? cashBalance : null);
			updateDatasetBalance(updatedDatasets, debtLabel, hasDebtBalance ? debtBalance : null);
			updateDatasetBalance(updatedDatasets, investmentsLabel, hasInvestmentsBalance ? investmentsBalance : null); // prettier-ignore
			updateDatasetBalance(updatedDatasets, otherAssetsLabel, hasOtherAssetsBalance ? otherAssetsBalance : null); // prettier-ignore
			updateDatasetBalance(updatedDatasets, netWorthLabel, netWorthBalance);
		}

		return updatedDatasets;
	};
	const trendNetWorthDataset = updateNetWorthDataset();

	const updateNetWorthTable = async (): Promise<TrendNetWorthTable[]> => {
		const today = dateInUTC(new Date());
		const oneWeekAgo = subWeeks(today, 1);
		const oneMonthAgo = subMonths(today, 1);
		const sixMonthsAgo = subMonths(today, 6);
		const firstOfCurrentYear = startOfYear(today);
		const oneYearAgo = subYears(today, 1);
		const fiveYearsAgo = subYears(today, 5);
		const weeksInPeriod = trendNetWorthLabels;

		const datasets = await trendNetWorthDataset;
		const netWorthDataset = datasets.find(({ label }) => label === netWorthLabel)?.data as number[]; // prettier-ignore
		const cashDataset = datasets.find(({ label }) => label === cashLabel)?.data as number[]; // prettier-ignore
		const debtDataset = datasets.find(({ label }) => label === debtLabel)?.data as number[]; // prettier-ignore
		const investmentsDataset = datasets.find(({ label }) => label === investmentsLabel)?.data as number[]; // prettier-ignore
		const otherAssetsDataset = datasets.find(({ label }) => label === otherAssetsLabel)?.data as number[]; // prettier-ignore

		const rowNetWorth = trendNetWorthTable.find(({ name }) => name === netWorthLabel) as TrendNetWorthTable; // prettier-ignore
		const rowCash = trendNetWorthTable.find(({ name }) => name === cashLabel) as TrendNetWorthTable; // prettier-ignore
		const rowDebt = trendNetWorthTable.find(({ name }) => name === debtLabel) as TrendNetWorthTable; // prettier-ignore
		const rowInvestments = trendNetWorthTable.find(({ name }) => name === investmentsLabel) as TrendNetWorthTable; // prettier-ignore
		const rowOtherAssets = trendNetWorthTable.find(({ name }) => name === otherAssetsLabel) as TrendNetWorthTable; // prettier-ignore

		for (const weekInPeriod of weeksInPeriod) {
			const currentWeek = dateInUTC(new Date(weekInPeriod));
			const netWorthPeriod = netWorthDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const cashPeriod = cashDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const debtPeriod = debtDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const investmentsPeriod = investmentsDataset[weeksInPeriod.indexOf(weekInPeriod)];
			const otherAssetsPeriod = otherAssetsDataset[weeksInPeriod.indexOf(weekInPeriod)];

			if (isSameWeek(currentWeek, dateInUTC(new Date(weeksInPeriod[0])))) {
				console.warn('max', currentWeek);
				console.warn(
					'otherAssetsDataset.find((balance) => balance !== null)',
					otherAssetsDataset.find((balance) => balance !== null)
				);
				console.warn('weekInPeriod', weekInPeriod);
				console.warn('-------------------------------------------------------');
				rowNetWorth.balanceMax = netWorthPeriod;
				rowCash.balanceMax = cashDataset.find((balance) => balance !== null) || null;
				rowDebt.balanceMax = debtDataset.find((balance) => balance !== null) || null;
				rowInvestments.balanceMax = investmentsDataset.find((balance) => balance !== null) || null;
				rowOtherAssets.balanceMax = otherAssetsDataset.find((balance) => balance !== null) || null;
			}
			if (isSameWeek(currentWeek, oneWeekAgo)) {
				console.warn('oneWeek', currentWeek);
				console.warn('otherAssetsPeriod', otherAssetsPeriod);
				console.warn('weekInPeriod', weekInPeriod);
				console.warn('-------------------------------------------------------');
				rowNetWorth.balanceOneWeek = netWorthPeriod;
				rowCash.balanceOneWeek = cashPeriod;
				rowDebt.balanceOneWeek = debtPeriod;
				rowInvestments.balanceOneWeek = investmentsPeriod;
				rowOtherAssets.balanceOneWeek = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, oneMonthAgo)) {
				console.warn('oneMonth', currentWeek);
				console.warn('otherAssetsPeriod', otherAssetsPeriod);
				console.warn('weekInPeriod', weekInPeriod);
				console.warn('-------------------------------------------------------');
				rowNetWorth.balanceOneMonth = netWorthPeriod;
				rowCash.balanceOneMonth = cashPeriod;
				rowDebt.balanceOneMonth = debtPeriod;
				rowInvestments.balanceOneMonth = investmentsPeriod;
				rowOtherAssets.balanceOneMonth = otherAssetsPeriod;
			}
			if (isSameWeek(currentWeek, sixMonthsAgo)) {
				console.warn('sixMonthsAgo', currentWeek);
				console.warn('otherAssetsPeriod', otherAssetsPeriod);
				console.warn('weekInPeriod', weekInPeriod);
				console.warn('-------------------------------------------------------');
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
			if (isSameWeek(currentWeek, dateInUTC(new Date(weeksInPeriod[weeksInPeriod.length - 1])))) {
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
