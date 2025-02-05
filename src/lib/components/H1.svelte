<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<h1 class="text-chromeo-950 text-2xl font-bold tracking-tight">
	{@render children()}
</h1>
