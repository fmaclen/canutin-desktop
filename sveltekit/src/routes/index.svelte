<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatCurrency } from '$lib/helpers/misc';
	import { TrailingCashflowPeriods } from '$lib/helpers/constants';
	import { balanceGroupAppearance, CardAppearance } from '$lib/components/Card';
	import type { BigPictureSummary, TrailingCashflow } from '.';

	export let title = 'The big picture';
	export let bigPictureSummary: BigPictureSummary;
	export let trailingCashflow: TrailingCashflow;
	export let currentSegment = TrailingCashflowPeriods.LAST_6_MONTHS;
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

	{@const { last6Months, last12Months } = trailingCashflow}

	<Section title="Trailing cashflow">
		<nav slot="HEADER">{currentSegment}</nav>
		<div class="bigPictureTrailingCashflow" slot="CONTENT">
			{@const segment =
				currentSegment === TrailingCashflowPeriods.LAST_6_MONTHS ? last6Months : last12Months}

			{@const incomeAverage = (segment?.incomeAverage && segment.incomeAverage) || 0}
			<Card title="Income per month" value={formatCurrency(incomeAverage)} />
			{@const expensesAverage = (segment?.expensesAverage && segment.expensesAverage) || 0}
			<Card title="Expenses per month" value={formatCurrency(expensesAverage)} />
			{@const surplusAverage = (segment?.surplusAverage && segment.surplusAverage) || 0}
			<Card title="Surplus per month" value={formatCurrency(surplusAverage)} />
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.bigPictureSummary,
	div.bigPictureTrailingCashflow {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-column-gap: 8px;
	}

	div.bigPictureSummary {
		grid-template-rows: repeat(2, 1fr);
		grid-row-gap: 8px;
	}
</style>
