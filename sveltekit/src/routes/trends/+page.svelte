<script lang="ts">
	import { onMount } from 'svelte';
	import type { ChartDataset } from 'chart.js';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	import { BalanceGroup, TrendPeriods } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import ChartJs from '$lib/components/ChartJS.svelte';

	const title = 'Trends';

	export let data: PageData;

	let currentSegment = TrendPeriods.LIFETIME;
	const toggleSegment = () => {
		currentSegment =
			currentSegment === TrendPeriods.SIX_MONTHS ? TrendPeriods.LIFETIME : TrendPeriods.SIX_MONTHS;
	};

	const chartNetWorth: ChartDataset[] = [];
	const chartCash: ChartDataset[] = [];
	const chartDebt: ChartDataset[] = [];
	const chartInvestments: ChartDataset[] = [];
	const chartOtherAssets: ChartDataset[] = [];

	data.datasets.forEach((dataset, i) => {
		switch (dataset.balanceGroup) {
			case BalanceGroup.CASH:
				chartCash.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#00A36F'
				});
				break;
			case BalanceGroup.DEBT:
				chartDebt.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#e75258'
				});
				break;
			case BalanceGroup.INVESTMENTS:
				chartInvestments.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#B19B70'
				});
				break;
			case BalanceGroup.OTHER_ASSETS:
				chartOtherAssets.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#5255AC'
				});
				break;
			default:
				chartNetWorth.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#0366D6'
				});
		}
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Net worth">
		<div slot="HEADER">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrendPeriods)}
				callback={toggleSegment}
			/>
		</div>
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={chartNetWorth} />
		</div>
	</Section>

	<Section title="Cash">
		<div slot="HEADER" class="import">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrendPeriods)}
				callback={toggleSegment}
			/>
		</div>
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={chartCash} />
		</div>
	</Section>

	<Section title="Debt">
		<div slot="HEADER" class="import">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrendPeriods)}
				callback={toggleSegment}
			/>
		</div>
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={chartDebt} />
		</div>
	</Section>

	<Section title="Investments">
		<div slot="HEADER" class="import">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrendPeriods)}
				callback={toggleSegment}
			/>
		</div>
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={chartInvestments} />
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="HEADER" class="import">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrendPeriods)}
				callback={toggleSegment}
			/>
		</div>
		<div slot="CONTENT">
			<ChartJs labels={data.labels} datasets={chartOtherAssets} />
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	.chart {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(384px, 25vh);
		box-sizing: border-box;
		background-color: var(--color-white);
		box-shadow: var(--box-shadow);
		border-radius: 4px;
		padding: 16px 32px 32px 32px;
	}
</style>
