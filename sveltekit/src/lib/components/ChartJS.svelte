<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ChartDataset } from 'chart.js';

	export let labels: string[];
	export let datasets: ChartDataset[];

	let canvasChart: HTMLCanvasElement;

	const FONT_FAMILY = '"Inter", Helvetica, Arial, sans-serif';
	const config: ChartConfiguration = {
		type: 'line',
		data: {
			labels,
			datasets
		},
		options: {
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
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: datasets.length > 1,
					labels: {
						font: {
							family: FONT_FAMILY,
							size: 13
						},
						usePointStyle: true,
						boxWidth: 4,
						boxHeight: 4,
						padding: 12
					}
				},
				tooltip: {
					padding: 8,
					caretPadding: 16,
					yAlign: 'top',
					usePointStyle: true,
					boxWidth: 8,
					boxHeight: 8,
					cornerRadius: 4,
					bodyFont: {
						family: FONT_FAMILY,
						size: 13
					}
				}
			},
			scales: {
				x: {
					beginAtZero: true,
					ticks: {
						padding: 16,
						callback: (index: any) => {
							// Display tick every 7 ticks (a.ka. 1 week)
							if (index % 7 === 0) return labels[index];
						}
					},
					min: 1,
					max: 104,
					grid: {
						tickLength: 0,
						tickWidth: 0,
						offset: false
					}
				},
				y: {
					beginAtZero: true,
					display: false
				}
			}
		}
	};

	onMount(() => {
		const context = canvasChart.getContext('2d');
		context && new Chart(context, config);
	});

	// only return indexes every 10 idexes
	// const labels = data.labels.filter((_, index) => index % 10 === 0);
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
		box-shadow: var(--box-shadow);
		border-radius: 4px;
		padding-top: 8px;
	}
</style>
