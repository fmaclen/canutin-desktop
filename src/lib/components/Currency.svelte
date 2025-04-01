<script lang="ts">
	import Number from './Number.svelte';

	interface Props {
		value?: number | null;
		currency?: string;
		locale?: string;
		maximumFractionDigits?: number;
	}

	let { value, currency, locale, maximumFractionDigits = 0 }: Props = $props();

	// Format: $1,523.00 || -$1,523.00
	const formattedValue = $derived(
		new Intl.NumberFormat(locale, {
			currency,
			style: 'currency',
			maximumFractionDigits
		}).format(value ?? 0)
	);
</script>

<Number value={formattedValue} />
