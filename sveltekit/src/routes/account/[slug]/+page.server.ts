import prisma from '$lib/helpers/prisma';
import { getSelectAccountTypes, selectBalanceGroups } from '$lib/helpers/forms';
import type { Account } from '@prisma/client';
import { BalanceGroup, SortOrder } from '$lib/helpers/constants';
import { notFound } from '$lib/helpers/misc';
import type { ChartDataset } from 'chart.js';
import { add, eachWeekOfInterval, endOfWeek, sub } from 'date-fns';
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

	// Create chart dataset
	const labels: string[] = [];
	const balanceHistoryDataset: ChartDataset | null = { label: account.name, data: [] };

	const earliestBalanceStatement = await prisma.accountBalanceStatement.findFirst({
		where: {
			accountId: account.id
		},
		orderBy: {
			createdAt: SortOrder.ASC
		}
	});

	const endOfThisWeek = endOfWeek(new Date());
	const weeksInPeriod = eachWeekOfInterval({
		start: earliestBalanceStatement?.createdAt || sub(endOfThisWeek, { years: 2 }), // FIXME
		end: lastBalanceStatement?.createdAt || add(endOfThisWeek, { days: 1 }) // FIXME
	});

	for (const weekInPeriod of weeksInPeriod) {
		labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
		const balance = await getAccountCurrentBalance(account, weekInPeriod);
		balanceHistoryDataset.data.push(balance);

		switch (account.balanceGroup) {
			case BalanceGroup.CASH:
				balanceHistoryDataset.backgroundColor = '#00A36F'; // var(--color-bluePrimary)
				balanceHistoryDataset.borderColor = '#00A36F'; // var(--color-bluePrimary)
				break;
			case BalanceGroup.DEBT:
				balanceHistoryDataset.backgroundColor = '#e75258'; // var(--color-bluePrimary)
				balanceHistoryDataset.borderColor = '#e75258'; // var(--color-bluePrimary)
				break;
			case BalanceGroup.INVESTMENTS:
				balanceHistoryDataset.backgroundColor = '#B19B70'; // var(--color-bluePrimary)
				balanceHistoryDataset.borderColor = '#B19B70'; // var(--color-bluePrimary)
				break;
			case BalanceGroup.OTHER_ASSETS:
				balanceHistoryDataset.backgroundColor = '#5255AC'; // var(--color-bluePrimary)
				balanceHistoryDataset.borderColor = '#5255AC'; // var(--color-bluePrimary)
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
