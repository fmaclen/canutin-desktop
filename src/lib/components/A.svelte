<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		href: string;
		target?: '_blank' | '_self';
		children: Snippet;
	}

	let { href, target = '_self', children }: Props = $props();
</script>

<a {href} {target} class="border-b-chromeo-400 hover:text-brand h-max border-b text-inherit">
	{@render children()}
</a>
