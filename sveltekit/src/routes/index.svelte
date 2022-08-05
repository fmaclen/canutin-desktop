<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import { formatCurrency } from '$lib/helpers/misc';
	import { TrailingCashflowPeriods } from '$lib/helpers/constants';
	import { balanceGroupAppearance, CardAppearance } from '$lib/components/Card';
	import type { BigPictureSummary, TrailingCashflow } from '.';

	export let title = 'The big picture';

	// Summary
	export let bigPictureSummary: BigPictureSummary;

	// Trailing cashflow
	export let trailingCashflow: TrailingCashflow;
	export let currentSegment = TrailingCashflowPeriods.LAST_6_MONTHS;
	export let toggleSegment = () => {
		currentSegment =
			currentSegment === TrailingCashflowPeriods.LAST_6_MONTHS
				? TrailingCashflowPeriods.LAST_12_MONTHS
				: TrailingCashflowPeriods.LAST_6_MONTHS;
	};
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

	<Section title="Trailing cashflow">
		<nav class="segmentedControl" slot="HEADER">
			{#each Object.values(TrailingCashflowPeriods) as period}
				<button
					class="segmentedControl__button {currentSegment == period &&
						'segmentedControl__button--active'}"
					type="button"
					on:click={toggleSegment}>{period}</button
				>
			{/each}
		</nav>
		<div class="bigPictureTrailingCashflow" slot="CONTENT">
			{@const { last6Months, last12Months } = trailingCashflow}
			{@const segment =
				currentSegment === TrailingCashflowPeriods.LAST_6_MONTHS ? last6Months : last12Months}
			<Card title="Income per month" value={formatCurrency(segment.incomeAverage)} />
			<Card title="Expenses per month" value={formatCurrency(segment.expensesAverage)} />
			<Card title="Surplus per month" value={formatCurrency(segment.surplusAverage)} />
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

	nav.segmentedControl {
		display: grid;
		grid-gap: 4px;
		grid-auto-flow: column;
	}

	button.segmentedControl__button {
		font-family: var(--font-monospace);
		text-transform: uppercase;
		font-size: 12px;
		line-height: 1em;
		border: none;
		background-color: var(--color-grey10);
		padding: 6px 8px;
		border-radius: 4px;
		color: var(--color-grey50);
		cursor: pointer;

		&:hover {
			color: var(--color-grey70);
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-white);
			box-shadow: var(--box-shadow);
			pointer-events: none;
		}
	}
</style>
