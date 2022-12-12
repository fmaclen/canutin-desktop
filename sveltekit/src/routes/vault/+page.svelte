<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';
	import type { PageData } from './$types';

	const title = 'Vault';

	export let data: PageData;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title} isFullscreen={true}>
	<Section title="Error">
		<div slot="CONTENT">
			<Notice isError={true}>
				The vault at <Code>{data.vaultPath}</Code>
				{data.error}
			</Notice>
		</div>
	</Section>
</ScrollView>
