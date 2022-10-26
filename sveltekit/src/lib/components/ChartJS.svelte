<script lang="ts">
	import Chart from 'chart.js/auto';
	import { onMount } from 'svelte';
	import type { ChartConfiguration, ChartDataset } from 'chart.js';

	export let labels: string[];
	export let datasets: ChartDataset[];

	let canvasChart: HTMLCanvasElement;

	onMount(() => {
		// Getting the font family from a CSS variable
		const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-sansSerif');

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
								family: fontFamily,
								size: 13
							},
							usePointStyle: true,
							boxWidth: 4,
							boxHeight: 4,
							padding: 12
						}
					},
					tooltip: {
						mode: 'index',
						intersect: false,
						padding: 12,
						caretPadding: 16,
						usePointStyle: true,
						boxWidth: 8,
						boxHeight: 8,
						cornerRadius: 4,
						bodyFont: {
							family: fontFamily,
							size: 13
						}
					}
				},
				scales: {
					x: {
						beginAtZero: true,
						min: 7, // "Trim" the first week so the chart sticks to the left border nicely
						max: 104,
						ticks: {
							padding: 16,
							callback: (index: any) => {
								// Display tick every 7 ticks (a.k.a. 1 week)
								if (index % 14 === 0) return labels[index];
							}
						},
						grid: {
							tickLength: 0,
							tickWidth: 0,
							offset: true
						}
					},
					y: {
						beginAtZero: true,
						display: false
					}
				}
			}
		};

		const context = canvasChart.getContext('2d');
		context && new Chart(context, config);
	});
</script>

<div class="chart">
	<canvas bind:this={canvasChart} />
</div>

<style lang="scss">
	.chart {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(384px, 25vh);
		box-sizing: border-box;
		background-color: var(--color-white);
		box-shadow: var(--box-shadow), inset 0 -48px 0 var(--color-grey3);
		border-radius: 4px;
		padding-top: 8px;
	}
</style>
