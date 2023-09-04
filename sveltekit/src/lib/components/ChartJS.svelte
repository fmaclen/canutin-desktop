<script lang="ts">
	// Need to import ChartJS this way or it will break in the packaged app
	// REF: https://github.com/sveltejs/kit/issues/5535
	import Chart from 'chart.js/auto/auto.mjs';

	import { onMount } from 'svelte';
	import type { ChartConfiguration, ChartDataset } from 'chart.js';
	import { formatCurrency } from '$lib/helpers/misc';
	import iconLoading from '$lib/assets/icon-loading.svg';

	export let labels: string[];
	export let datasets: ChartDataset[];
	export let isLoading: boolean = false;

	let canvasChart: HTMLCanvasElement;

	// Gets CSS values from the global variables set in `app.scss` to style ChartsJS
	const getValueFromCSSVariable = (variable: string) => {
		return getComputedStyle(document.documentElement).getPropertyValue(variable);
	};

	let chart: Chart | null;

	onMount(() => {
		// Getting the font family from a CSS variable
		const config: ChartConfiguration = {
			type: 'line',
			data: {
				labels,
				datasets
			},
			options: {
				animation: false,
				maintainAspectRatio: false,
				interaction: {
					mode: 'index',
					intersect: false
				},
				datasets: {
					line: {
						pointStyle: 'circle',
						pointRadius: 0,
						pointHitRadius: 64,
						pointHoverBorderWidth: 1,
						borderWidth: 1.25,
						tension: 0.25
					}
				},
				plugins: {
					legend: {
						display: datasets.length > 1,
						labels: {
							font: {
								family: getValueFromCSSVariable('--font-sansSerif'),
								size: 13
							},
							usePointStyle: true,
							boxWidth: 4,
							boxHeight: 4,
							padding: 12
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								// e.g. " Alice's Limited Rewards      $420.69"
								return ` ${context.dataset.label}      ${formatCurrency(context.parsed.y)}`;
							}
						},

						mode: 'index',
						intersect: false,
						padding: 12,
						caretPadding: 16,
						usePointStyle: true,
						boxWidth: 8,
						boxHeight: 8,
						cornerRadius: 4,
						bodyFont: {
							family: getValueFromCSSVariable('--font-sansSerif'),
							size: 13
						}
					}
				},
				scales: {
					x: {
						ticks: {
							font: {
								family: getValueFromCSSVariable('--font-monospace')
							},
							padding: 16,
							autoSkipPadding: 80,
							maxRotation: 0, // Prevent labels from rotating to fit on the canvas
							color: getValueFromCSSVariable('--color-grey30'),
							callback: (index: any) => {
								if (index === 0) return ''; // Hide the first label to prevent clutter between labels on the y-axis
								return labels[index];
							}
						},
						grid: {
							drawBorder: false,
							tickLength: 0 // Removes an extra space between the chart and the axis labels
						}
					},
					y: {
						grace: '5%',
						ticks: {
							font: {
								family: getValueFromCSSVariable('--font-monospace')
							},
							padding: 16,
							align: 'center',
							color: getValueFromCSSVariable('--color-grey30'),
							z: 2,
							callback: (value: any, index: any, ticks: any) => {
								// Only show ticks for zero, max and min values and format the value to currency
								if (index === 0 || index === ticks.length - 1 || value === 0) {
									return formatCurrency(value);
								}
							}
						},
						grid: {
							drawBorder: false,
							tickLength: 0, // Removes an extra space between the chart and the axis labels
							z: 1, // Make the zero line appear on top of chat data with a value of zero
							lineWidth: (context) => (context.tick.value == 0 ? 1 : 0) //Set only zero line visible
						}
					}
				}
			}
		};

		const context = canvasChart.getContext('2d');
		chart = context && new Chart(context, config);
	});

	$: datasets && chart?.update();
</script>

<div class="chart {datasets.length > 1 && 'chart--multiple-datasets'}">
	{#if isLoading}
		<img src={iconLoading} class="chart__loading" alt="Loading..." />
	{/if}
	<canvas class="chart__canvas {isLoading && 'chart__canvas--loading'}" bind:this={canvasChart} />
</div>

<style lang="scss">
	.chart {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(384px, 25vh);
		box-sizing: border-box;
		background-color: var(--color-white);
		box-shadow: var(--box-shadow);
		border-radius: 4px;
		position: relative;

		&--multiple-datasets {
			padding-top: 8px;
			padding-bottom: 8px;
		}
	}

	canvas.chart__canvas--loading {
		opacity: 0.5;
		filter: grayscale(100%);
	}

	img.chart__loading {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
