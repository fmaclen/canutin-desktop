<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		isNegative?: boolean;
		children: Snippet;
	}

	let { isNegative = false, children }: Props = $props();
</script>

<div
	class="rounded-md p-8 text-center text-sm {isNegative
		? 'bg-rose-50 text-rose-500'
		: 'bg-chromeo-300'}"
>
	{@render children()}
</div>
