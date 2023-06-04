<script lang="ts">
		import { PLAUSIBLE_DOMAIN } from '$env/static/private';

	export let title: string | string[];

	const SEPARATOR = '·';
	const formattedTitle = typeof title !== 'string' ? title.join(` ${SEPARATOR} `) : title;
</script>

<svelte:head>
	<title>{formattedTitle} {SEPARATOR} Canutin</title>

	{#if PLAUSIBLE_DOMAIN}
		<script defer data-domain={PLAUSIBLE_DOMAIN} src="https://plausible.io/js/script.js" />
	{/if}
</svelte:head>
