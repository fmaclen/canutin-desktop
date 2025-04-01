<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<header class="bg-chromeo-100">
	<div class="container mx-auto flex flex-row items-baseline justify-between px-24 py-8 text-sm border-b border-chromeo-300">
		{@render children()}
	</div>
</header>
