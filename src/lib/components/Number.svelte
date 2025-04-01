<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		size?: string;
		children: Snippet;
	}

	let { children, size = 'base' }: Props = $props();
</script>

<span class="font-mono text-inherit uppercase tracking-widest text-{size}">{@render children()}</span>
