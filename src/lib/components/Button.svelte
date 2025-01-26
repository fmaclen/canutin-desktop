<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		children: Snippet;
		onclick: () => void;
		disabled?: boolean;
		variant?: 'default' | 'icon' | 'primary' | 'mobile';
	}

	let { title, children, onclick, disabled, variant = 'default' }: Props = $props();
</script>

<button class="button button--{variant}" type="button" {title} {onclick} {disabled}>
	{#if variant === 'icon'}
		<span class="button__hit-area">{@render children()}</span>
	{:else}
		{@render children()}
	{/if}
</button>

<style>
	.button {
		@apply flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-semibold tracking-tight;
		@apply disabled:cursor-not-allowed disabled:opacity-50;
		@apply active:scale-90;
		@apply transition-all duration-100;
	}

	@media (hover: hover) {
		.button {
			@apply hover:border-chromeo-300 hover:bg-chromeo-300;
		}
	}

	.button--icon {
		@apply p-0;
	}

	.button--primary {
		@apply border-accent bg-accent text-white;
		@apply hover:border-accent hover:bg-accent/80;
	}

	.button--mobile {
		@apply md:hidden;
	}

	.button__hit-area {
		@apply block h-full p-2 opacity-40 hover:opacity-100;
		@apply hover:scale-125;
		@apply active:scale-75;
		@apply transition-all duration-100;
	}
</style>
