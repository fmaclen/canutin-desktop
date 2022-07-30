<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import type { ImportSummary } from '$lib/helpers/importFromCanutinFile';

	export let title = 'Import data';
	export let importSummary: ImportSummary | undefined;

	const submitForm = (event: any) => {
		event.preventDefault();

		const rawFile = event.target.file.files[0];
		if (!rawFile) return; // FIXME: alert the user if the canutinFile is invalid

		const reader = new FileReader();
		reader.onload = async (event: ProgressEvent<FileReader>) => {
			const canutinFile = JSON.parse(event?.target?.result as string);
			const response = await fetch('/import.json', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(canutinFile)
			});
			importSummary = await response.json();
		};

		reader.readAsText(rawFile);
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Import data">
		<div slot="CONTENT">
			<form on:submit={submitForm}>
				<input type="file" name="file" accept=".json" />
				<button>Upload</button>
			</form>

			{#if importSummary}
				<code class="code">{importSummary.error}</code>
				<code class="code">{JSON.stringify(importSummary.importedAccounts)}</code>
				<code class="code">{JSON.stringify(importSummary.importedAssets)}</code>
			{/if}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	code.code {
		display: block;
		margin-top: 32px;
		background-color: var(--color-grey10);
		font-family: var(--font-monospace);
		font-size: 12px;
		padding: 16px;
		border-radius: 4px;
	}
</style>
