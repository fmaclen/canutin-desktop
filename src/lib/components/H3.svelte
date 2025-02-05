<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<h3 class="font-mono uppercase tracking-widest text-xs text-chromeo-700">
	{@render children()}
</h3>
