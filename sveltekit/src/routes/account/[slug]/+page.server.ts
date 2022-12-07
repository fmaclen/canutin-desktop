import prisma from '$lib/helpers/prisma.server';
import { getSelectAccountTypes } from '$lib/helpers/forms.server';
import { selectBalanceGroups } from '$lib/helpers/forms';
import { SortOrder } from '$lib/helpers/constants';
import { notFound } from '$lib/helpers/misc';
import { handlePeriodEnd, setChartDatasetColor } from '$lib/helpers/charts';
import { eachWeekOfInterval, startOfWeek } from 'date-fns';
import { getAccountCurrentBalance } from '$lib/helpers/models.server';
import type { ChartDataset } from 'chart.js';
import type { Account } from '@prisma/client';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug || Number.isNaN(parseInt(slug))) return notFound();

	const account = (await prisma.account.findUnique({ where: { id: parseInt(slug) } })) as Account;

	if (!account) return notFound();

	const selectAccountTypes = await getSelectAccountTypes();
	const transactionsCount = await prisma.transaction.count({
		where: { accountId: account.id }
	});

	// Generate chart dataset
	const labels: string[] = [];
	const balanceHistoryDataset: ChartDataset = { label: account.name, data: [] };
	const queryByAccount = { where: { accountId: account.id } };

	let periodStart: Date | undefined;
	let periodEnd: Date | undefined;

	if (account.isAutoCalculated) {
		// When the account is auto-calculated, the balance history is based on the earliest and most recent transaction date
		const earliestQuery = { ...queryByAccount, orderBy: { date: SortOrder.ASC } };
		const latestQuery = { ...queryByAccount, orderBy: { date: SortOrder.DESC } };

		periodStart = await prisma.transaction.findFirst(earliestQuery).then((t) => t?.date);
		periodEnd = await prisma.transaction.findFirst(latestQuery).then((t) => t?.date);
	} else {
		// When the account is NOT auto-calculated, the balance history is based on the earliest and most recent balance statement
		const earliestQuery = { ...queryByAccount, orderBy: { createdAt: SortOrder.ASC } };
		const latestQuery = { ...queryByAccount, orderBy: { createdAt: SortOrder.DESC } };

		periodStart = await prisma.accountBalanceStatement.findFirst(earliestQuery).then((abs) => abs?.createdAt); // prettier-ignore
		periodEnd = await prisma.accountBalanceStatement.findFirst(latestQuery).then((abs) => abs?.createdAt); // prettier-ignore
	}

	if (periodStart && periodEnd) {
		const weeksInPeriod = eachWeekOfInterval({
			start: startOfWeek(periodStart),
			end: handlePeriodEnd(periodEnd)
		});

		for (const weekInPeriod of weeksInPeriod) {
			labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
			const balance = await getAccountCurrentBalance(account, weekInPeriod);
			balanceHistoryDataset.data.push(balance);
			setChartDatasetColor(balanceHistoryDataset, account.balanceGroup);
		}
	}

	// Get the most recent balance from the balance history dataset
	const { data } = balanceHistoryDataset;
	const latestBalance = data.length > 0 ? (data[data.length - 1] as number) : 0;

	return {
		account,
		selectAccountTypes,
		selectBalanceGroups,
		latestBalance,
		transactionsCount,
		labels,
		balanceHistoryDataset
	};
};
