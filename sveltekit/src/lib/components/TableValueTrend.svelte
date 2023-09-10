<script lang="ts">
	import TableValue from '$lib/components/TableValue.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
	import { formatCurrency, formatPercentage } from '../helpers/misc';

	export let value: number | null = null;
	export let performance: number | null = null;
	export let isReversed: boolean = false;

	const isTrendNeutral = performance === 0;

	const getTrendSymbol = () => {
		if (isTrendNeutral) return '';
		if (performance !== null) {
			if (isReversed && performance < 0) return '';
			return performance > 0 ? '+' : '';
		}
	};
</script>

{#if value !== null && performance !== null}
	{@const isTrendPositive = isReversed ? performance < 0 : performance > 0}

	<TableValue
		title={`From ${formatCurrency(value, 2, 2)}`}
		isPositive={!isTrendNeutral && isTrendPositive}
		isNegative={!isTrendNeutral && !isTrendPositive}
		isNumeric={true}
	>
		{getTrendSymbol()}{formatPercentage(performance)}
	</TableValue>
{:else}
	<TableNoValue />
{/if}
