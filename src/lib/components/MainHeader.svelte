<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<header class="bg-chromeo-100 flex flex-row justify-between">
	<div class="container mx-auto px-24 py-6">
		{@render children()}
	</div>
</header>
