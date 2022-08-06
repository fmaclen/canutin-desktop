<script lang="ts">
	import currentPeriodBackground from '$lib/assets/chart-current-background.svg';

	export let isCurrentPeriod: boolean;
	export let isActive: boolean;
	export let isLabelVisible: boolean;
	export let value: string | number;
	export let height: number;
	export let positiveRatio: number;
	export let negativeRatio: number;
	export let sentiment: string | undefined;

	let barGridTemplateRows = `grid-template-rows: ${Math.round(positiveRatio)}fr 1px ${Math.round(
		negativeRatio
	)}fr;`;
	let barHeight = `height: calc(${height}% - 32px);`;
	let barBackground = isCurrentPeriod ? `--background-url: url(${currentPeriodBackground});` : '';
</script>

<div class="chart__barContainer" style={barGridTemplateRows} title={value.toString()}>
	{#if sentiment === 'negative'}
		<div class="chart__barPlaceholder" />
		<hr class="chart__hr" />
	{/if}

	{#if sentiment === 'positive' || sentiment === 'negative'}
		<div class="chart__bar {sentiment && `chart__bar--${sentiment}`}">
			<p class="chart__label {isLabelVisible && 'chart__label--visible'}">
				{value}
			</p>

			<div
				class="chart__graph {isActive &&
					!isCurrentPeriod &&
					'chart__graph--active'} {isCurrentPeriod && 'chart__graph--currentPeriod'}"
				style={`${barHeight} ${barBackground}`}
			/>
		</div>
	{:else}
		<div class="chart__barPlaceholder" />
		<hr class="chart__hr" />
		<div class="chart__barPlaceholder" />
	{/if}

	{#if sentiment === 'positive'}
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
		box-sizing: border-box;
	}

	div.chart__bar {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 32px;
		overflow: hidden;
		color: var(--color-grey50);
		border: none;

		&--positive {
			color: var(--color-greenPrimary);

			p.chart__label {
				margin-top: auto;
			}

			div.chart__graph {
				padding-top: 8px;
				border-top: 3px solid var(--color-greenPrimary);

				&:not(div.chart__graph--currentPeriod, div.chart__graph--active) {
					background-color: var(--color-greenSecondary);
				}

				&--active {
					background-color: var(--color-greenPrimary);
				}
			}
		}

		&--negative {
			flex-direction: column-reverse;
			color: var(--color-redPrimary);

			p.chart__label {
				margin-bottom: auto;
			}

			div.chart__graph {
				border-bottom: 3px solid var(--color-redPrimary);

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
		&--currentPeriod {
			background-color: var(--color-white);
			background-image: var(--background-url);
			background-size: 40px;
		}
	}

	p.chart__label {
		font-family: var(--font-monospace);
		font-size: 12px;
		min-height: 12px;
		margin: 0;
		padding: 12px 4px 8px 4px;
		text-align: center;
		opacity: 0;
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
