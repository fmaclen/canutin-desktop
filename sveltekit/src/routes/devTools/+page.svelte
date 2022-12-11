<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import {
		Appearance,
		DeveloperFunctions,
		ONE_SECOND_IN_MS,
		UNDOABLE_ACTION
	} from '$lib/helpers/constants';
	import type { PageData } from './$types';

	const title = 'Developer tools';

	export let data: PageData;
	let isLoading = false;

	const submitFunction = async (functionType: DeveloperFunctions) => {
		const isDeletionFunction = [
			DeveloperFunctions.DB_WIPE,
			DeveloperFunctions.DB_WIPE_TRANSACTIONS,
			DeveloperFunctions.DB_WIPE_ACCOUNTS_ASSETS
		].includes(functionType);

		if (isDeletionFunction) {
			const confirmDeletion = window.confirm(
				`${UNDOABLE_ACTION}You are about to permanently delete data from the vault:\n\n${data.dbUrl}\n\nAre you sure you want to continue?`
			);
			if (!confirmDeletion) return;
		}

		isLoading = true;
		const response = await fetch(`/devTools.json?functionType=${functionType}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		// These processes are really quick so we induce a longer delay before we enable the UI again
		if (response) setTimeout(() => (isLoading = false), ONE_SECOND_IN_MS);

		// Reset the sync status if we've wiped the database
		if (response.ok && functionType === DeveloperFunctions.DB_WIPE) {
			$syncStatusStore = {
				isSyncSetup: false,
				isSyncEnabled: false
			};
		}
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
				<Button on:click={() => submitFunction(DeveloperFunctions.DB_SEED)} disabled={isLoading}>
					Seed demo data
				</Button>
			</nav>

			<nav class="nav">
				<Button
					on:click={() => submitFunction(DeveloperFunctions.DB_WIPE_TRANSACTIONS)}
					appearance={Appearance.NEGATIVE}
					disabled={isLoading}
				>
					Delete transactions only
				</Button>
				<Button
					on:click={() => submitFunction(DeveloperFunctions.DB_WIPE_ACCOUNTS_ASSETS)}
					appearance={Appearance.NEGATIVE}
					disabled={isLoading}
				>
					Delete accounts, transactions & assets
				</Button>
			</nav>

			<nav class="nav">
				<Button
					on:click={() => submitFunction(DeveloperFunctions.DB_WIPE)}
					appearance={Appearance.NEGATIVE}
					disabled={isLoading}
				>
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
