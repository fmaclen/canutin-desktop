<script lang="ts">
	import Currency from '$lib/components/Currency.svelte';

	interface Props {
		key: string;
		value: number;
	}

	let { key, value }: Props = $props();
</script>

<div class="flex h-full w-full flex-row items-center justify-between">
	<p class="key p-4 text-sm font-bold tracking-tight">{key}</p>
	<p class="value p-4 text-sm">
		<Currency {value} currency="USD" locale="en-US" />
	</p>
</div>
