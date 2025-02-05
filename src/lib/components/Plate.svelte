<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		variant?: 'netWorth' | 'cash' | 'investments' | 'debt' | 'otherAssets' | 'default';
	}

	let { children, variant = 'default' }: Props = $props();

	// Define base classes that are always applied
	const baseClasses = ['plate shadow rounded-md'];

	// Define variant-specific classes
	const variantClasses = {
		netWorth: 'bg-netWorth text-chromeo-50 h-full',
		cash: 'bg-cash text-chromeo-50',
		investments: 'bg-investments text-chromeo-50',
		debt: 'bg-debt text-chromeo-50',
		otherAssets: 'bg-otherAssets text-chromeo-50',
		default: 'bg-chromeo-100'
	};
</script>

<div class={baseClasses.concat(variantClasses[variant])}>
	{@render children()}
</div>
