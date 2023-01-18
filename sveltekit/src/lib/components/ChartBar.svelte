<script lang="ts">
	import currentPeriodBackground from '$lib/assets/chart-current-background.svg';

	export let isCurrentPeriod: boolean;
	export let isActive: boolean;
	export let isLabelVisible: boolean;
	export let value: string | number;
	export let height: number;
	export let positiveRatio: number;
	export let negativeRatio: number;
	export let trend: string | undefined;

	// When the positive and negative ratio are the same we render them in a 1:1 ratio.
	// The most common scenario is when the chart has no data and all the values are 0.
	if (positiveRatio === negativeRatio) {
		positiveRatio = 1;
		negativeRatio = 1;
	}

	let barGridTemplateRows = `grid-template-rows: ${Math.round(positiveRatio)}fr 1px ${Math.round(
		negativeRatio
	)}fr;`;
	let barHeight = `height: ${height}%;`;
	let barBackground = isCurrentPeriod ? `--background-url: url(${currentPeriodBackground});` : '';
</script>

<div class="chart__barContainer" style={barGridTemplateRows}>
	{#if trend === 'negative'}
		<div class="chart__barPlaceholder" />
		<hr class="chart__hr" />
	{/if}

	{#if trend === 'positive' || trend === 'negative'}
		<div class="chart__bar {trend && `chart__bar--${trend}`}">
			<div
				class="chart__graph {isActive &&
					!isCurrentPeriod &&
					'chart__graph--active'} {isCurrentPeriod && 'chart__graph--currentPeriod'}"
				style={`${barHeight} ${barBackground}`}
			>
				<p class="chart__label {isLabelVisible && 'chart__label--visible'}">
					{value}
				</p>
			</div>
		</div>
	{:else}
		<div class="chart__barPlaceholder" />
		<hr class="chart__hr" />
		<div class="chart__barPlaceholder" />
	{/if}

	{#if trend === 'positive'}
		<hr class="chart__hr" />
		<div class="chart__barPlaceholder" />
	{/if}
</div>

<style lang="scss">
	div.chart__barContainer {
		display: grid;
		width: 100%;
		height: 50vh;
		min-height: 256px;
		max-height: 320px;
		padding: 32px 0;
		box-sizing: border-box;
	}

	div.chart__bar {
		display: flex;
		flex-direction: column;
		width: 100%;
		color: var(--color-grey50);
		border: none;

		&--positive {
			color: var(--color-greenPrimary);
			height: 100%;

			p.chart__label {
				top: -32px;
				padding-bottom: 12px;
			}

			div.chart__graph {
				border-top: 3px solid var(--color-greenPrimary);
				margin-top: auto;

				&:not(div.chart__graph--currentPeriod, div.chart__graph--active) {
					background-color: var(--color-greenSecondary);
				}

				&--active {
					background-color: var(--color-greenPrimary);
				}
			}
		}

		&--negative {
			color: var(--color-redPrimary);
			height: 100%;

			p.chart__label {
				bottom: -32px;
				padding-top: 12px;
			}

			div.chart__graph {
				border-bottom: 3px solid var(--color-redPrimary);
				margin-bottom: auto;

				&:not(div.chart__graph--currentPeriod, div.chart__graph--active) {
					background-color: var(--color-redSecondary);
				}

				&--active {
					background-color: var(--color-redPrimary);
				}
			}
		}
	}

	div.chart__graph {
		position: relative;

		&--currentPeriod {
			background-color: var(--color-white);
			background-image: var(--background-url);
			background-size: 40px;
		}
	}

	p.chart__label {
		position: absolute;
		width: 100%;
		box-sizing: border-box;
		padding: 8px 4px;
		font-family: var(--font-monospace);
		font-size: 12px;
		line-height: 1em;
		margin: 0;
		opacity: 0;
		text-align: center;
		overflow: hidden;
		text-overflow: ellipsis;

		&--visible {
			opacity: 1;
		}
	}

	hr.chart__hr {
		border: none;
		height: 1px;
		margin: 0;
		background-color: var(--color-border);
	}
</style>
