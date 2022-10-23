<script lang="ts">
	import Values from 'values.js';
	import type { ChartDataset } from 'chart.js';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import { BalanceGroup, SortOrder } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	const title = 'Trends';

	export let data: PageData;

	// const COLOR_WEIGHT = 125;
	// const setBorderColor = (chartDatasets: ChartDataset[], color: string, orderBy?: SortOrder) => {
	// 	// Before setting a border color we need to sort the dataset in a meaningul way.
	// 	// Because values can vary a lot, we choose to sort by the most recent value in the dataset.
	// 	chartDatasets.sort((a, b) => {
	// 		const aLastValue = (a.data[a.data.length - 1] || 0) as number;
	// 		const bLastValue = (b.data[b.data.length - 1] || 0) as number;

	// 		// NOTE: in the case of `chartDebt` the sort order is reversed.
	// 		return orderBy === SortOrder.ASC ? bLastValue - aLastValue : aLastValue - bLastValue;
	// 	});

	// 	chartDatasets.forEach((chartDataset, i) => {
	// 		chartDataset.borderColor = new Values(color)
	// 			.all(COLOR_WEIGHT / chartDatasets.length)
	// 			[i].hexString();
	// 	});
	// };

	// const chartNetWorth: ChartDataset[] = data.datasets.filter((dataset) => dataset.balanceGroup === undefined); // prettier-ignore
	// const chartCash: ChartDataset[] = data.datasets.filter((dataset) => dataset.balanceGroup === BalanceGroup.CASH); // prettier-ignore
	// const chartDebt: ChartDataset[] = data.datasets.filter((dataset) => dataset.balanceGroup === BalanceGroup.DEBT); // prettier-ignore
	// const chartInvestments: ChartDataset[] = data.datasets.filter((dataset) => dataset.balanceGroup === BalanceGroup.INVESTMENTS); // prettier-ignore
	// const chartOtherAssets: ChartDataset[] = data.datasets.filter((dataset) => dataset.balanceGroup === BalanceGroup.OTHER_ASSETS); // prettier-ignore

	// setBorderColor(chartCash, '#00A36F');
	// setBorderColor(chartDebt, '#e75258', SortOrder.ASC);
	// setBorderColor(chartInvestments, '#B19B70');
	// setBorderColor(chartOtherAssets, '#5255AC');
	// setBorderColor(chartNetWorth, '#0366D6');

	// console.log(data.datasetCash);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Net worth">
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={data.datasetNetWorth} />
		</div>
	</Section>

	<Section title="Cash">
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={data.datasetCash} />
		</div>
	</Section>

	<Section title="Debt">
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={data.datasetDebt} />
		</div>
	</Section>

	<Section title="Investments">
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={data.datasetInvestments} />
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={data.datasetOtherAssets} />
		</div>
	</Section>
</ScrollView>
