<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';
	import type { ChartDataset } from 'chart.js';

	const title = 'Trends';

	export let data: PageData;

	function updateDatasets(originalDatasets: any, streamedDatasets: ChartDataset[]): ChartDataset[] {
		for (const streamedDataset of streamedDatasets) {
			const dataset = originalDatasets.find(
				(dataset: ChartDataset) => dataset.label === streamedDataset.label
			);
			if (dataset) {
				dataset.data = streamedDataset.data;
				dataset.backgroundColor = streamedDataset.backgroundColor;
				dataset.borderColor = streamedDataset.borderColor;
			}
		}
		return originalDatasets;
	}

	let cashDatasetsIsLoading = true;
	const cashDatasets = writable<ChartDataset[]>(data.trendCash.datasets);
	data.streaming.trendCashDataset.then((streamedDatasets: ChartDataset[]) => {
		cashDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets));
		cashDatasetsIsLoading = false;
	});

	let debtDatasetsIsLoading = true;
	const debtDatasets = writable<ChartDataset[]>(data.trendDebt.datasets);
	data.streaming.trendDebtDataset.then((streamedDatasets: ChartDataset[]) => {
		debtDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets));
		debtDatasetsIsLoading = false;
	});

	let investmentsDatasetsIsLoading = true;
	const investmentsDatasets = writable<ChartDataset[]>(data.trendInvestments.datasets);
	data.streaming.trendInvestmentsDataset.then((streamedDatasets: ChartDataset[]) => {
		investmentsDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets));
		investmentsDatasetsIsLoading = false;
	});

	let otherAssetsDatasetsIsLoading = true;
	const otherAssetsDatasets = writable<ChartDataset[]>(data.trendOtherAssets.datasets);
	data.streaming.trendOtherAssetsDataset.then((streamedDatasets: ChartDataset[]) => {
		otherAssetsDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets));
		otherAssetsDatasetsIsLoading = false;
	});

	let netWorthDatasetsIsLoading = true;
	const netWorthDatasets = writable<ChartDataset[]>(data.trendNetWorth.datasets);
	data.streaming.trendNetWorthDataset.then((streamedDatasets: ChartDataset[]) => {
		netWorthDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets));
		netWorthDatasetsIsLoading = false;
	});
</script>

<Head {title} />

<ScrollView {title}>
	<Section title="Net worth">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendNetWorth.labels}
				datasets={$netWorthDatasets}
				isLoading={netWorthDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Cash">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendCash.labels}
				datasets={$cashDatasets}
				isLoading={cashDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Debt">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendDebt.labels}
				datasets={$debtDatasets}
				isLoading={debtDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Investments">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendInvestments.labels}
				datasets={$investmentsDatasets}
				isLoading={investmentsDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendOtherAssets.labels}
				datasets={$otherAssetsDatasets}
				isLoading={otherAssetsDatasetsIsLoading}
			/>
		</div>
	</Section>
</ScrollView>
