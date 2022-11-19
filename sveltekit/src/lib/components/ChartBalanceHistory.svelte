<script lang="ts">
	import ChartJs from './ChartJS.svelte';
	import Notice from './Notice.svelte';
	import Section from './Section.svelte';
	import type { ChartDataset } from 'chart.js';

	export let balanceHistoryDataset: ChartDataset;
	export let labels: string[];
</script>

<Section title="Balance history">
	<div slot="CONTENT">
		{#if balanceHistoryDataset.data.length > 0}
			<ChartJs {labels} datasets={[balanceHistoryDataset]} />
		{:else}
			<Notice>Balance history doesn't have enough data points to graph</Notice>
		{/if}
	</div>
</Section>
