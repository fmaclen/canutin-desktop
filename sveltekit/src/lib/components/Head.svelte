<script lang="ts">
	export let title: string | string[];

	const SEPARATOR = '·';
	const formattedTitle = typeof title !== 'string' ? title.join(` ${SEPARATOR} `) : title;
</script>

<svelte:head>
	<title>{formattedTitle} {SEPARATOR} Canutin</title>
</svelte:head>
