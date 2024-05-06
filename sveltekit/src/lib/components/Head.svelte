<script lang="ts">
	export let title: string | string[];

	const SEPARATOR = '·';
	const formattedTitle = typeof title !== 'string' ? title.join(` ${SEPARATOR} `) : title;
</script>

<svelte:head>
	<title>{formattedTitle} {SEPARATOR} Canutin</title>

	{#if process.env.PUBLIC_PLAUSIBLE_DOMAIN}
		<script
			defer
			data-domain={process.env.PUBLIC_PLAUSIBLE_DOMAIN}
			src="https://plausible.io/js/script.js"
		></script>
	{/if}
</svelte:head>
