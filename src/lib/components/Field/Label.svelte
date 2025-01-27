<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		children: Snippet;
	}

	let { children, id }: Props = $props();
</script>

{#if children}
	<label for={id} class="text-xs font-medium tracking-wide opacity-60">
		{@render children()}
	</label>
{/if}
