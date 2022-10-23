<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ChartDataset } from 'chart.js';

	export let labels: string[];
	export let datasets: ChartDataset[];

	let canvasChart: HTMLCanvasElement;

	const config: ChartConfiguration = {
		type: 'line',
		data: {
			labels,
			datasets
		},
		options: {
			datasets: {
				line: {
					fill: false,
					pointRadius: 2,
					pointHitRadius: 64,
					borderWidth: 2,
					tension: 0.25
				}
			},
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: true
				}
			}
		}
	};

	onMount(() => {
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
		box-shadow: var(--box-shadow);
		border-radius: 4px;
		padding: 16px 32px 32px 32px;
	}
</style>
