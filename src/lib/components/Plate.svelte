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
		netWorth: 'bg-chromeo-950 text-chromeo-50 h-full',
		cash: 'bg-emerald-600 text-chromeo-50',
		investments: 'bg-yellow-600 text-chromeo-50',
		debt: 'bg-red-500 text-chromeo-50',
		otherAssets: 'bg-indigo-600 text-chromeo-50',
		default: 'bg-chromeo-100'
	};
</script>

<div class={baseClasses.concat(variantClasses[variant])}>
	{@render children()}
</div>
