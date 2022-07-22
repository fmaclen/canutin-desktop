<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatCurrency } from '$lib/helpers/currency';
	import { balanceGroupAppearance, CardAppearance } from '$lib/components/Card';
	import type { BigPictureSummary } from '.';

	export let title = 'The big picture';
	export let bigPictureSummary: BigPictureSummary;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Summary">
		<div class="bigPictureSummary" slot="CONTENT">
			<Card
				title="Net worth"
				value={formatCurrency(bigPictureSummary.netWorth)}
				appearance={CardAppearance.NET_WORTH}
			/>

			{#each bigPictureSummary.balanceGroups as balanceGroup}
				<Card
					title={balanceGroup.label}
					value={formatCurrency(balanceGroup.currentBalance)}
					appearance={balanceGroupAppearance(balanceGroup.id)}
				/>
			{/each}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.bigPictureSummary {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		grid-column-gap: 8px;
		grid-row-gap: 8px;
	}
</style>
