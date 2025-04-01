<script lang="ts">
	import Number from '$lib/components/Number.svelte';

	interface Props {
		key: string;
		value: number | string;
	}

	let { key, value }: Props = $props();
</script>

<div class="flex h-full w-full flex-row items-center justify-between">
	<p class="key p-4 text-sm font-bold tracking-tight">{key}</p>
	<p class="value p-4 text-sm">
		{#if typeof value === 'number'}
			<Number {value} />
		{:else}
			{value}
		{/if}
	</p>
</div>
