<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<section class="container mx-auto my-12 flex flex-col gap-2 px-24">
	{@render children()}
</section>
