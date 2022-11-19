import prisma from '$lib/helpers/prisma';
import { getSelectAccountTypes, selectBalanceGroups } from '$lib/helpers/forms';
import type { Account } from '@prisma/client';
import { SortOrder } from '$lib/helpers/constants';
import { notFound, setChartDatasetColor } from '$lib/helpers/misc';
import type { ChartDataset } from 'chart.js';
import { eachWeekOfInterval } from 'date-fns';
import { getAccountCurrentBalance } from '$lib/helpers/models';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug || Number.isNaN(parseInt(slug))) return notFound();

	const account = (await prisma.account.findUnique({ where: { id: parseInt(slug) } })) as Account;

	if (!account) return notFound();

	const selectAccountTypes = await getSelectAccountTypes();
	const lastBalanceStatement = await prisma.accountBalanceStatement.findFirst({
		where: {
			accountId: account.id
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	// Generate chart dataset
	const labels: string[] = [];
	const balanceHistoryDataset: ChartDataset = { label: account.name, data: [] };
	const queryByAccount = { where: { accountId: account.id } }; // prettier-ignore

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
			start: periodStart,
			end: periodEnd
		});

		for (const weekInPeriod of weeksInPeriod) {
			labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
			const balance = await getAccountCurrentBalance(account, weekInPeriod);
			balanceHistoryDataset.data.push(balance);
			setChartDatasetColor(balanceHistoryDataset, account.balanceGroup);
		}
	}

	return {
		account,
		selectAccountTypes,
		selectBalanceGroups,
		lastBalanceStatement,
		labels,
		balanceHistoryDataset
	};
};
