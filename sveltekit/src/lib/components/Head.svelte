<script lang="ts">
	import { PUBLIC_PLAUSIBLE_DOMAIN } from '$env/static/public';

	export let title: string | string[];

	const SEPARATOR = '·';
	const formattedTitle = typeof title !== 'string' ? title.join(` ${SEPARATOR} `) : title;
</script>

<svelte:head>
	<title>{formattedTitle} {SEPARATOR} Canutin</title>

	{#if PUBLIC_PLAUSIBLE_DOMAIN}
		<script
			defer
			data-domain={PUBLIC_PLAUSIBLE_DOMAIN}
			src="https://plausible.io/js/script.js"
		></script>
	{/if}
</svelte:head>
