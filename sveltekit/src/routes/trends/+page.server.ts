import { SortOrder } from '$lib/helpers/constants';
import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models';
import prisma from '$lib/helpers/prisma';
import { endOfMonth, sub, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

const today = endOfMonth(new Date());

export const load = async () => {
	const labels: string[] = [];
	const datasets: { label: string; data: number[]; balanceGroup?: number }[] = [];

	const defaultPeriod = sub(today, { years: 2 });
	const weeksInPeriod = eachWeekOfInterval({
		// start: (await getLifetimeDate()) || defaultPeriod,
		start: defaultPeriod,
		end: today
	});

	const accounts = await prisma.account.findMany();
	const assets = await prisma.asset.findMany();

	for (const weekInPeriod of weeksInPeriod) {
		labels.push(weekInPeriod.toISOString().slice(0, 10));

		let netWorth = 0;

		for (const account of accounts) {
			const balance = await getAccountCurrentBalance(account, weekInPeriod);

			const accountDataset = datasets.find(({ label }) => label === account.name);
			accountDataset
				? accountDataset.data.push(balance)
				: datasets.push({
						label: account.name,
						balanceGroup: account.balanceGroup,
						data: [balance]
				  });

			netWorth = netWorth + balance;
		}

		for (const asset of assets) {
			const balance = await getAssetCurrentBalance(asset, weekInPeriod);
			const assetDataset = datasets.find(({ label }) => label === asset.name);
			assetDataset
				? assetDataset.data.push(balance)
				: datasets.push({
						label: asset.name,
						balanceGroup: asset.balanceGroup,
						data: [balance]
				  });
			netWorth = netWorth + balance;
		}

		const netWorthDataset = datasets.find(({ label }) => label === 'Net worth');
		netWorthDataset
			? netWorthDataset.data.push(netWorth)
			: datasets.push({
					label: 'Net worth',
					data: [netWorth]
			  });
	}

	return {
		datasets,
		labels
	};
};

const getLifetimeDate = async (): Promise<Date | undefined> => {
	const oldestBalanceStatementParams = {
		where: {
			createdAt: {
				lte: today
			}
		},
		select: {
			createdAt: true
		},
		orderBy: {
			createdAt: SortOrder.ASC
		}
	};

	const oldestAccountBalanceStatement = await prisma.accountBalanceStatement.findFirst(oldestBalanceStatementParams); // prettier-ignore
	const oldestAssetBalanceStatement = await prisma.assetBalanceStatement.findFirst(oldestBalanceStatementParams); // prettier-ignore

	// Oldest transaction from an account that is autoCalculated
	const oldestTransaction = await prisma.transaction.findFirst({
		where: {
			date: {
				lte: today
			},
			account: {
				isAutoCalculated: true
			}
		},
		select: {
			date: true
		},
		orderBy: {
			date: SortOrder.ASC
		}
	});

	const oldestDates = [];
	oldestAccountBalanceStatement?.createdAt && oldestDates.push(oldestAccountBalanceStatement.createdAt); // prettier-ignore
	oldestAssetBalanceStatement?.createdAt && oldestDates.push(oldestAssetBalanceStatement.createdAt);
	oldestTransaction?.date && oldestDates.push(oldestTransaction.date);

	return oldestDates.length > 1
		? oldestDates.sort((a, b) => a.getTime() - b.getTime())[0]
		: undefined;
};
