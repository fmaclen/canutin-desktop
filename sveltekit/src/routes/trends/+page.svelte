<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import type { PageData } from './$types';

	const title = 'Trends';

	export let data: PageData;
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
