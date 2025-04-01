<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<header class="bg-chromeo-100">
	<div
		class="border-chromeo-300 container mx-auto flex flex-row items-baseline justify-between border-b px-24 py-8 text-sm"
	>
		{@render children()}
	</div>
</header>
