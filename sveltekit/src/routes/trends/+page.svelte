<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart, type ChartConfiguration } from 'chart.js/auto/auto.js';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	import { BalanceGroup, TrendPeriods } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	const title = 'Trends';

	export let data: PageData;

	let currentSegment = TrendPeriods.LIFETIME;
	const toggleSegment = () => {
		currentSegment =
			currentSegment === TrendPeriods.SIX_MONTHS ? TrendPeriods.LIFETIME : TrendPeriods.SIX_MONTHS;
	};

	const chartNetWorth: any[] = [];
	const chartCash: any[] = [];
	const chartDebt: any[] = [];
	const chartInvestments: any[] = [];
	const chartOtherAssets: any[] = [];

	data.datasets.forEach((dataset, i) => {
		switch (dataset.balanceGroup) {
			case BalanceGroup.CASH:
				chartCash.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#00A36F',
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					lineTension: 0.25
				});
				break;
			case BalanceGroup.DEBT:
				chartDebt.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#e75258',
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					lineTension: 0.25
				});
				break;
			case BalanceGroup.INVESTMENTS:
				chartInvestments.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#B19B70',
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					lineTension: 0.25
				});
				break;
			case BalanceGroup.OTHER_ASSETS:
				chartOtherAssets.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#5255AC',
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					lineTension: 0.25
				});
				break;
			default:
				chartNetWorth.push({
					label: dataset.label,
					data: dataset.data,
					borderColor: '#0366D6',
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					lineTension: 0.25
				});
		}
	});

	const config: ChartConfiguration = {
		type: 'line',

		options: {
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true
				}
			}
		}
	};

	let canvasChartNetWorth: any;
	let canvasChartCash: any;
	let canvasChartDebt: any;
	let canvasChartInvestments: any;
	let canvasChartOtherAssets: any;

	onMount(() => {
		new Chart(canvasChartNetWorth.getContext('2d'), {
			...config,
			data: {
				labels: data.labels,
				datasets: chartNetWorth
			}
		});
		new Chart(canvasChartCash.getContext('2d'), {
			...config,
			data: {
				labels: data.labels,
				datasets: chartCash
			}
		});
		new Chart(canvasChartDebt.getContext('2d'), {
			...config,
			data: {
				labels: data.labels,
				datasets: chartDebt
			}
		});
		new Chart(canvasChartInvestments.getContext('2d'), {
			...config,
			data: {
				labels: data.labels,
				datasets: chartInvestments
			}
		});
		new Chart(canvasChartOtherAssets.getContext('2d'), {
			...config,
			data: {
				labels: data.labels,
				datasets: chartOtherAssets
			}
		});
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
			<div class="chart">
				<canvas bind:this={canvasChartNetWorth} />
			</div>
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
			<div class="chart">
				<canvas bind:this={canvasChartCash} />
			</div>
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
			<div class="chart">
				<canvas bind:this={canvasChartDebt} />
			</div>
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
			<div class="chart">
				<canvas bind:this={canvasChartInvestments} />
			</div>
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
			<div class="chart">
				<canvas bind:this={canvasChartOtherAssets} />
			</div>
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
