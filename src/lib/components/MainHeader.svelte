<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<header class="bg-chromeo-100">
	<div class="container mx-auto px-24 py-6 flex flex-row justify-between text-sm items-baseline">
		{@render children()}
	</div>
</header>
