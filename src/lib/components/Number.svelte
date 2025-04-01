<script lang="ts">
	import NumberFlow from '@number-flow/svelte';

	interface Props {
		size?: string;
		value: number;
	}

	let { value, size = 'base' }: Props = $props();
</script>

<span class="font-mono tracking-widest text-inherit uppercase text-{size}">
	<NumberFlow
		{value}
		format={{
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
			minimumFractionDigits: 0
		}}
	/>
</span>
