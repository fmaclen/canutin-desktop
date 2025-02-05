<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<h3 class="text-chromeo-700 font-mono text-xs tracking-widest uppercase">
	{@render children()}
</h3>
