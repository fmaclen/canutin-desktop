<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import { Appearance, DeveloperFunctions } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	const title = 'Developer tools';

	export let data: PageData;
	let isLoading = false;

	const setStatusSuccess = () => {
		$statusBarStore = {
			message: 'Database action was performed, likely without errors',
			appearance: Appearance.POSITIVE
		};
		isLoading = false;
	};

	const setStatusError = () => {
		$statusBarStore = {
			message: "Something went wrong and it's likely the action wasn't performed",
			appearance: Appearance.NEGATIVE
		};
		isLoading = false;
	};

	const databaseSeed = async () => {
		isLoading = true;
		await fetch(`/devTools.json?functionType=${DeveloperFunctions.DB_SEED}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			response.ok ? setStatusSuccess() : setStatusError();
		});
	};

	const databaseWipeAccountsAssets = async () => {
		isLoading = true;
		await fetch(`/devTools.json?functionType=${DeveloperFunctions.DB_WIPE_ACCOUNTS_ASSETS}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			response.ok ? setStatusSuccess() : setStatusError();
		});
	};

	const databaseWipe = async () => {
		isLoading = true;
		await fetch(`/devTools.json?functionType=${DeveloperFunctions.DB_WIPE}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		}).then((response) => {
			response.ok ? setStatusSuccess() : setStatusError();
			$syncStatusStore = {
				isSyncSetup: false,
				isSyncEnabled: false
			};
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
				<Button on:click={databaseSeed} disabled={isLoading}>Seed demo data</Button>
				<Button
					on:click={databaseWipeAccountsAssets}
					appearance={Appearance.NEGATIVE}
					disabled={isLoading}
				>
					Delete accounts & assets
				</Button>
				<Button on:click={databaseWipe} appearance={Appearance.NEGATIVE} disabled={isLoading}>
					Delete all data
				</Button>
			</nav>
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
