<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';
	import { Appearance, DeveloperFunctions } from '$lib/helpers/constants';
	import type { PageData } from '.svelte-kit/types/src/routes/$types';

	const title = 'Developer tools';
	let isSuccesful: boolean = false;
	export let data: PageData;

	const databaseSeed = async () => {
		await fetch(`/devTools.json?functionType=${DeveloperFunctions.DB_SEED}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			isSuccesful = response.ok;
		});
	};

	const databaseWipe = async () => {
		await fetch(`/devTools.json?functionType=${DeveloperFunctions.DB_WIPE}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			isSuccesful = response.ok;
		});
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Database">
		<div slot="CONTENT" class="database">
			<Notice><Code>{data.dbUrl}</Code></Notice>

			<nav class="nav">
				<Button on:click={databaseSeed}>Seed demo data</Button>
				<Button on:click={databaseWipe} appearance={Appearance.NEGATIVE}>Delete all data</Button>
			</nav>

			{#if isSuccesful}
				<Notice>Database action was performed (likely without errors)</Notice>
			{/if}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.database {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
	}

	nav.nav {
		display: flex;
		flex-direction: row;
		column-gap: 12px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: flex;
		padding: 12px;
	}
</style>
