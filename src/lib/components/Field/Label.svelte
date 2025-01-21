<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		id: string;
		children: Snippet;
	}

	let { children, id }: Props = $props();
</script>

{#if children}
	<label for={id} class="field-label">
		{@render children()}
	</label>
{/if}

<style lang="postcss">
	.field-label {
		@apply text-xs font-medium tracking-wide opacity-60;
	}
</style>
