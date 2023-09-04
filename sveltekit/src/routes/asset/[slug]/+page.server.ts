import { getSelectAssetTypes, getQuantifiableAssetTypes } from '$lib/helpers/forms.server';
import { selectBalanceGroups } from '$lib/helpers/forms';
import prisma from '$lib/helpers/prisma.server';
import type { Asset } from '@prisma/client';
import { SortOrder } from '$lib/helpers/constants';
import { notFound } from '$lib/helpers/misc';
import { setChartDatasetColor } from '$lib/helpers/charts';
import type { ChartDataset } from 'chart.js';
import { eachWeekOfInterval, startOfWeek } from 'date-fns';
import { getAssetBalanceDateRange, getAssetCurrentBalance } from '$lib/helpers/models.server';
import { handlePeriodEnd } from '$lib/helpers/charts';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug || Number.isNaN(parseInt(slug))) return notFound();

	const asset = (await prisma.asset.findUnique({ where: { id: parseInt(slug) } })) as Asset;

	if (!asset) return notFound();

	const selectAssetTypes = await getSelectAssetTypes();
	const quantifiableAssetTypes = await getQuantifiableAssetTypes();

	// Generate chart dataset
	const labels: string[] = [];
	const balanceHistoryDataset: ChartDataset = { label: asset.name, data: [] };

	const latestQuery = { where: { assetId: asset.id }, orderBy: { createdAt: SortOrder.DESC } };
	const lastBalanceStatement = await prisma.assetBalanceStatement.findFirst(latestQuery);

	const { periodStart, periodEnd } = await getAssetBalanceDateRange(asset);
	if (periodStart && periodEnd) {
		const weeksInPeriod = eachWeekOfInterval({
			start: startOfWeek(periodStart),
			end: handlePeriodEnd(periodEnd)
		});

		for (const weekInPeriod of weeksInPeriod) {
			labels.push(weekInPeriod.toISOString().slice(0, 10)); // e.g. 2022-12-31
			const balance = await getAssetCurrentBalance(asset, weekInPeriod);
			balanceHistoryDataset.data.push(balance);
			setChartDatasetColor(balanceHistoryDataset, asset.balanceGroup);
		}
	}

	return {
		asset,
		selectAssetTypes,
		selectBalanceGroups,
		quantifiableAssetTypes,
		lastBalanceStatement,
		labels,
		balanceHistoryDataset
	};
};
