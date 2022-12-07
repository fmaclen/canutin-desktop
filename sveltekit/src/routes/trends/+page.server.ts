import Values from 'values.js';
import prisma from '$lib/helpers/prisma.server';
import type { ChartDataset } from 'chart.js';

import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models';
import { sub, eachWeekOfInterval, endOfWeek } from 'date-fns';
import { BalanceGroup, SortOrder } from '$lib/helpers/constants';
import { setChartDatasetColor } from '$lib/helpers/charts';
import { handlePeriodEnd } from '$lib/helpers/charts';

export const load = async () => {
	const labels: string[] = [];
	const datasetNetWorth: ChartDataset[] = [];
	const datasetCash: ChartDataset[] = [];
	const datasetDebt: ChartDataset[] = [];
	const datasetInvestments: ChartDataset[] = [];
	const datasetOtherAssets: ChartDataset[] = [];

	// Add balance to dataset
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

	const endOfThisWeek = endOfWeek(new Date());
	const weeksInPeriod = eachWeekOfInterval({
		start: sub(endOfThisWeek, { years: 2 }), // Two years ago
		end: handlePeriodEnd(endOfThisWeek)
	});

	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();

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
	}

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
		datasetOtherAssets
	};
};
