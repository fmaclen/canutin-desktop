<script lang="ts">
	import { format, fromUnixTime } from 'date-fns';
	import type { PageData } from './$types';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import ChartBar from '$lib/components/ChartBar.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import { formatCurrency } from '$lib/helpers/misc';
	import { BalanceGroup, TrailingCashflowPeriods } from '$lib/helpers/constants';
	import { balanceGroupAppearance, CardAppearance } from '$lib/components/Card';
	import type { PeriodCashflow } from './+page.server';

	const title = 'The big picture';

	export let data: PageData;
	$: ({ summary, cashflow, trailingCashflow } = data);

	// Cashflow
	$: currentPeriod = cashflow.periods[cashflow.periods.length - 1];
	$: activePeriod = currentPeriod.id;
	$: activeIncome = currentPeriod.income;
	$: activeExpenses = currentPeriod.expenses;
	$: activeSurplus = currentPeriod.surplus;
	let setActivePeriod = (period: PeriodCashflow) => {
		activePeriod = period.id;
		activeIncome = period.income;
		activeExpenses = period.expenses;
		activeSurplus = period.surplus;
	};

	// Trailing cashflow
	let currentSegment = TrailingCashflowPeriods.LAST_6_MONTHS;
	const toggleSegment = () => {
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
				value={formatCurrency(summary.netWorth)}
				appearance={CardAppearance.NET_WORTH}
			/>

			{@const { balanceGroups } = summary}
			<div class="bigPictureSummary__balanceGroups">
				{#each [balanceGroups[BalanceGroup.CASH], balanceGroups[BalanceGroup.INVESTMENTS], balanceGroups[BalanceGroup.DEBT], balanceGroups[BalanceGroup.OTHER_ASSETS]] as balanceGroup}
					<Card
						title={balanceGroup.label}
						value={formatCurrency(balanceGroup.currentBalance)}
						appearance={balanceGroupAppearance(balanceGroup.id)}
					/>
				{/each}
			</div>
		</div>
	</Section>

	<Section title="Cashflow">
		<div slot="CONTENT" class="bigPictureCashflow">
			{@const { chart } = cashflow}

			<div class="chart">
				{#each cashflow.periods as period}
					{@const isCurrentPeriod = currentPeriod.id === period.id}
					{@const isActive = activePeriod === period.id}
					{@const isLabelVisible =
						isActive ||
						isCurrentPeriod ||
						[chart.highestSurplus, chart.lowestSurplus].includes(period.surplus)}
					{@const month = fromUnixTime(period.month)}
					{@const isJanuary = month.getMonth() === 0}

					<div
						class="chart__period {isActive && 'chart__period--active'} {isJanuary &&
							'chart__period--january'}"
						on:mouseenter={() => setActivePeriod(period)}
					>
						<ChartBar
							{isCurrentPeriod}
							{isActive}
							{isLabelVisible}
							value={formatCurrency(period.surplus)}
							height={period.chartRatio}
							trend={period.surplus > 0 ? 'positive' : period.surplus < 0 ? 'negative' : undefined}
							positiveRatio={chart.positiveRatio}
							negativeRatio={chart.negativeRatio}
						/>
						<time class="chart__time {isActive && 'chart__time--active'}">
							{format(month, 'MMM')}
							{isJanuary ? `'${format(month, 'yy')}` : ''}
						</time>
					</div>
				{/each}
			</div>
			<div class="bigPictureCashflow__summary">
				<Card
					title="Income"
					appearance={CardAppearance.SECONDARY}
					value={formatCurrency(activeIncome)}
				/>
				<Card
					title="Expenses"
					appearance={CardAppearance.SECONDARY}
					value={formatCurrency(activeExpenses)}
				/>
				<Card title="Surplus" value={formatCurrency(activeSurplus)} />
			</div>
		</div>
	</Section>

	<Section title="Trailing cashflow">
		<div slot="HEADER">
			<SegmentedControl
				{currentSegment}
				segments={Object.values(TrailingCashflowPeriods)}
				callback={toggleSegment}
			/>
		</div>
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
	div.bigPictureSummary {
		display: grid;
		grid-template-columns: 1fr 2fr;
		grid-column-gap: 20px;
	}

	div.bigPictureSummary__balanceGroups {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
		padding-left: 20px;
		border-left: 1px solid var(--color-border);
	}

	div.bigPictureCashflow {
		background-color: var(--color-white);
		border-radius: 4px;
		box-shadow: var(--box-shadow);
		width: 100%;
	}

	div.bigPictureCashflow__summary {
		border-radius: 0 0 4px 4px;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-gap: 8px;
		grid-column-start: span 12;
		padding: 16px;
		background-color: var(--color-grey3);
	}

	div.chart {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
	}

	div.chart__period {
		display: flex;
		flex-direction: column;
		border-left: 1px solid var(--color-border);
		border-bottom: 1px solid var(--color-border);

		&--active {
			background-color: var(--color-grey3);
			border-bottom-color: var(--color-grey3);
		}

		&--january {
			border-left-style: dashed;
		}
	}

	time.chart__time {
		display: flex;
		flex-direction: column;
		margin-top: auto;
		font-size: 11px;
		line-height: 1em;
		padding: 8px;
		box-sizing: border-box;
		text-align: center;
		color: var(--color-grey30);

		&--active {
			color: var(--color-grey70);
		}
	}

	div.bigPictureTrailingCashflow {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-column-gap: 8px;
	}
</style>
