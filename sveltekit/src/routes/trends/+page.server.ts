import Values from 'values.js';
import prisma from '$lib/helpers/prisma';
import type { ChartDataset } from 'chart.js';

import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models';
import { endOfMonth, sub, eachWeekOfInterval } from 'date-fns';
import { BalanceGroup, SortOrder } from '$lib/helpers/constants';

const today = endOfMonth(new Date());

export const load = async () => {
	const labels: string[] = [];
	const datasetNetWorth: ChartDataset[] = [];
	const datasetCash: ChartDataset[] = [];
	const datasetDebt: ChartDataset[] = [];
	const datasetInvestments: ChartDataset[] = [];
	const datasetOtherAssets: ChartDataset[] = [];

	// Assign item to dataset
	const itemToDataset = (label: string, balance: number, balanceGroup?: BalanceGroup) => {
		const itemData = { label, data: [balance] };

		// Find the item in the dataset by chart label
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

	const defaultPeriod = sub(today, { years: 2 });
	const weeksInPeriod = eachWeekOfInterval({
		start: defaultPeriod,
		end: today
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
			itemToDataset(name, balance, balanceGroup);
			balanceToBalanceGroupDataset(balanceGroup, balance);
		}

		for (const asset of assets) {
			const { name, balanceGroup } = asset;
			const balance = await getAssetCurrentBalance(asset, weekInPeriod);
			itemToDataset(name, balance, balanceGroup);
			balanceToBalanceGroupDataset(balanceGroup, balance);
		}

		itemToDataset('Net worth', netWorthPeriod);
		itemToDataset('Cash', cashPeriod);
		itemToDataset('Debt', debtPeriod);
		itemToDataset('Investments', investmentsPeriod);
		itemToDataset('Other assets', otherAssetsPeriod);
	}

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

	setShadedBorderColor(datasetCash, '#00A36F');
	setShadedBorderColor(datasetDebt, '#e75258', SortOrder.ASC);
	setShadedBorderColor(datasetInvestments, '#B19B70');
	setShadedBorderColor(datasetOtherAssets, '#5255AC');

	datasetNetWorth.forEach((chartDataset) => {
		switch (chartDataset.label) {
			case 'Net worth':
				chartDataset.backgroundColor = '#333333';
				chartDataset.borderColor = '#333333';
				break;
			case 'Cash':
				chartDataset.backgroundColor = '#00A36F';
				chartDataset.borderColor = '#00A36F';
				break;
			case 'Debt':
				chartDataset.backgroundColor = '#e75258';
				chartDataset.borderColor = '#e75258';
				break;
			case 'Investments':
				chartDataset.backgroundColor = '#B19B70';
				chartDataset.borderColor = '#B19B70';
				break;
			case 'Other assets':
				chartDataset.backgroundColor = '#5255AC';
				chartDataset.borderColor = '#5255AC';
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
