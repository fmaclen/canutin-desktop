<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
		onclick: () => void;
		disabled?: boolean;
		variant?: 'icon' | 'primary' | 'mobile' | 'default';
	}

	let { title, children, onclick, disabled, variant = 'default' }: Props = $props();

	// Define base classes that are always applied
	const baseClasses = [
		'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold tracking-tight',
		'disabled:cursor-not-allowed disabled:opacity-50',
		'active:scale-90',
		'transition-all duration-100'
	];

	// Define variant-specific classes
	const variantClasses = {
		default: 'hover:border-chromeo-300 hover:bg-chromeo-300',
		icon: 'p-0',
		primary: 'border-accent bg-accent text-white hover:border-accent hover:bg-accent/80',
		mobile: 'md:hidden'
	};
</script>

<button
	class={baseClasses.concat(variantClasses[variant])}
	type="button"
	{title}
	{onclick}
	{disabled}
>
	{#if variant === 'icon'}
		<span
			class="block h-full p-2 opacity-40 transition-all duration-100 hover:scale-125 hover:opacity-100 active:scale-75"
		>
			{@render children()}
		</span>
	{:else}
		{@render children()}
	{/if}
</button>
