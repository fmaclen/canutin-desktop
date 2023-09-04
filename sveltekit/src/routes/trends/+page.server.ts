import Values from 'values.js';
import prisma from '$lib/helpers/prisma.server';
import type { ChartDataset } from 'chart.js';

import {
	getAccountBalanceDateRange,
	getAccountCurrentBalance,
	getAssetBalanceDateRange,
	getAssetCurrentBalance
} from '$lib/helpers/models.server';
import { addWeeks, eachWeekOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import { BalanceGroup, SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';
import { setChartDatasetColor } from '$lib/helpers/charts';
import { handlePeriodInterval } from '$lib/helpers/charts';
import type { Account, Asset } from '@prisma/client';

interface TrendGroup {
	title: BalanceGroup | 'Net worth';
	labels: string[];
	datasets: ChartDataset[];
	accounts: Account[] | null;
	assets: Asset[] | null;
}

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

	earliestBalanceDates.sort((a, b) => (a > b ? 1 : -1));

	const weeksInPeriod = eachWeekOfInterval({
		start: handlePeriodInterval(earliestBalanceDates[0]),
		end: handlePeriodInterval(new Date())
	});
	for (const weekInPeriod of weeksInPeriod) {
		labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
	}
	return labels;
};

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
	const accounts = await prisma.account.findMany(); // prettier-ignore
	const assets = await prisma.asset.findMany(); // prettier-ignore

	const trendCashAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.CASH); // prettier-ignore
	const trendCashAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.CASH); // prettier-ignore
	const trendCashLabels = await getDatasetLabels(trendCashAccounts, trendCashAssets); // prettier-ignore
	const trendCash: TrendGroup = {
		title: BalanceGroup.CASH,
		labels: trendCashLabels,
		datasets: generateEmptyDataset(trendCashAccounts, trendCashAssets),
		accounts: trendCashAccounts,
		assets: trendCashAssets
	};

	const trendDebtAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	const trendDebtLabels = await getDatasetLabels(trendDebtAccounts, trendDebtAssets); // prettier-ignore
	const trendDebt: TrendGroup = {
		title: BalanceGroup.DEBT,
		labels: trendDebtLabels,
		datasets: generateEmptyDataset(trendDebtAccounts, trendDebtAssets),
		accounts: trendDebtAccounts,
		assets: trendDebtAssets
	};

	const trendInvestmentsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.INVESTMENTS ); // prettier-ignore
	const trendInvestmentsLabels = await getDatasetLabels(trendInvestmentsAccounts, trendInvestmentsAssets); // prettier-ignore
	const trendInvestments: TrendGroup = {
		title: BalanceGroup.INVESTMENTS,
		labels: trendInvestmentsLabels,
		datasets: generateEmptyDataset(trendInvestmentsAccounts, trendInvestmentsAssets),
		accounts: trendInvestmentsAccounts,
		assets: trendInvestmentsAssets
	};

	const trendOtherAssetsAccounts = accounts.filter((account) => account.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsAssets = assets.filter((asset) => asset.balanceGroup === BalanceGroup.OTHER_ASSETS ); // prettier-ignore
	const trendOtherAssetsLabels = await getDatasetLabels(trendOtherAssetsAccounts, trendOtherAssetsAssets); // prettier-ignore
	const trendOtherAssets: TrendGroup = {
		title: BalanceGroup.OTHER_ASSETS,
		labels: trendOtherAssetsLabels,
		datasets: generateEmptyDataset(trendOtherAssetsAccounts, trendOtherAssetsAssets),
		accounts: trendOtherAssetsAccounts,
		assets: trendOtherAssetsAssets
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

		if (color) {
			const COLOR_WEIGHT = 125;
			updatedDatasets.sort((a, b) => {
				const aLastValue = (a.data[a.data.length - 1] || 0) as number;
				const bLastValue = (b.data[b.data.length - 1] || 0) as number;
				// NOTE: in the case of `trendDebtDataset` the sort order is reversed.
				return orderBy === SortOrder.ASC ? bLastValue - aLastValue : aLastValue - bLastValue;
			});
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

	const updateNetWorthDataset = async (): Promise<ChartDataset[]> => {
		const updatedDatasets: ChartDataset[] = structuredClone(trendNetWorth.datasets);
		const weeksInPeriod = trendNetWorthLabels;

		for (const weekInPeriod of weeksInPeriod) {
			let netWorthBalance = 0;
			let cashBalance = 0;
			let debtBalance = 0;
			let investmentsBalance = 0;
			let otherAssetsBalance = 0;

			const cashDataIndex = trendCashLabels.indexOf(weekInPeriod);
			const debtDataIndex = trendDebtLabels.indexOf(weekInPeriod);
			const investmentsDataIndex = trendInvestmentsLabels.indexOf(weekInPeriod);
			const otherAssetsDataIndex = trendOtherAssetsLabels.indexOf(weekInPeriod);

			if (cashDataIndex !== -1) {
				(await trendCashDataset).forEach((dataset) => {
					cashBalance += dataset.data[cashDataIndex] as number;
					netWorthBalance += dataset.data[cashDataIndex] as number;
				});
			}
			if (debtDataIndex !== -1) {
				(await trendDebtDataset).forEach((dataset) => {
					debtBalance += dataset.data[debtDataIndex] as number;
					netWorthBalance += dataset.data[debtDataIndex] as number;
				});
			}
			if (investmentsDataIndex !== -1) {
				(await trendInvestmentsDataset).forEach((dataset) => {
					investmentsBalance += dataset.data[investmentsDataIndex] as number;
					netWorthBalance += dataset.data[investmentsDataIndex] as number;
				});
			}
			if (otherAssetsDataIndex !== -1) {
				(await trendOtherAssetsDataset).forEach((dataset) => {
					otherAssetsBalance += dataset.data[otherAssetsDataIndex] as number;
					netWorthBalance += dataset.data[otherAssetsDataIndex] as number;
				});
			}

			updateDatasetBalance(updatedDatasets, 'Cash', cashBalance); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Debt', debtBalance); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Investments', investmentsBalance); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Other assets', otherAssetsBalance); // prettier-ignore
			updateDatasetBalance(updatedDatasets, 'Net worth', netWorthBalance); // prettier-ignore
		}

		return updatedDatasets;
	};

	const trendNetWorthDataset = updateNetWorthDataset();

	return {
		trendNetWorth,
		trendCash,
		trendDebt,
		trendInvestments,
		trendOtherAssets,
		streaming: {
			trendCashDataset,
			trendDebtDataset,
			trendInvestmentsDataset,
			trendOtherAssetsDataset,
			trendNetWorthDataset
		}
	};
};
