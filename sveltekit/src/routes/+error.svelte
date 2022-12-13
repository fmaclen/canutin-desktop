<script>
	import { page } from '$app/stores';
	import { dev } from '$app/environment';
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';

	const title = `${$page.status === 404 ? 'Not found' : 'Something went wrong'}`;
</script>

<Head title={[`Error ${$page.status}`, title]} />

<ScrollView {title} isFullscreen={true}>
	<Section title={`Error ${$page.status.toString()}`}>
		<div slot="CONTENT">
			<Notice isError={$page.status !== 404}>
				{$page.status === 404
					? "No content found. Perhaps there's a typo in the address or followed a broken link"
					: "An error ocurred and whatever was happening likely didn't finish succesfully"}
			</Notice>

			{#if dev}
				<p class="errorMessage">
					<Code>
						{$page?.error?.message}
					</Code>
				</p>
			{/if}
		</div>
	</Section>
</ScrollView>
