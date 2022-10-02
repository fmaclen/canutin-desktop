<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Code from '$lib/components/Code.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import FormNoticeNotice from '$lib/components/FormNoticeNotice.svelte';
	import FormNoticeP from '$lib/components/FormNoticeP.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import { api } from '$lib/helpers/misc';
	import { CardAppearance } from '$lib/components/Card';
	import { SyncSettings, Appearance, EventFrequency } from '$lib/helpers/constants';
	import type { ImportSummary, ImportSync } from '$lib/helpers/import';

	const title = 'Import CanutinFile';

	// Set the loading state
	const setLoadingStatus = (message: string) => {
		isImportLoading = true;
		$statusBarStore = {
			message,
			appearance: Appearance.ACTIVE
		};
	};

	const setResultStatus = (message: string, appearance: Appearance) => {
		isImportLoading = false;
		$statusBarStore = {
			message,
			appearance
		};
	};

	// File form
	let isImportLoading: boolean = false;
	let noFileError: string | undefined = undefined;
	let importSummary: ImportSummary | undefined = undefined;

	const handleFileForm = (event: any) => {
		importSummary = undefined; // Reset the previous import summary (if any)

		const chosenFile = event.target.file.files[0];
		if (!chosenFile) {
			noFileError = 'No file was chosen';
			return;
		}

		setLoadingStatus('Processing import...');

		const reader = new FileReader();
		reader.onload = async (event: ProgressEvent<FileReader>) => {
			const canutinFile = JSON.parse(event?.target?.result as string);
			importSummary = await api({ endpoint: 'import', method: 'POST', payload: canutinFile });

			// Update the status bar
			setResultStatus(
				importSummary?.error ? importSummary.error : 'Import was successful',
				importSummary?.error ? Appearance.NEGATIVE : Appearance.POSITIVE
			);
		};

		reader.readAsText(chosenFile);
	};

	// Sync form
	export let data: PageData;
	$: ({ settings } = data);

	$: isSyncEnabled = false;
	$: canutinFileUrlValue = '';
	$: frequencyValue = 0;
	$: cookieValue = '';
	$: jwtValue = '';

	const handleSyncForm = async (event: any) => {
		const canutinFileUrl = event.target.canutinFileUrl?.value;
		const frequency = event.target.frequency?.value;
		const cookie = event.target.cookie?.value;
		const jwt = event.target.jwt?.value;

		if (!canutinFileUrl) return;

		const payload: ImportSync = {
			canutinFileUrl,
			frequency,
			cookie,
			jwt
		};

		!isSyncEnabled && setLoadingStatus('Checking the CanutinFile URL...');

		const response = await api({
			endpoint: 'sync',
			method: 'POST',
			payload: payload
		});

		// Update the status bar
		setResultStatus(
			response?.error
				? response?.error
				: response?.warning
				? response.warning
				: 'Sync was enabled succesfully',
			response?.error
				? Appearance.NEGATIVE
				: response?.warning
				? Appearance.WARNING
				: Appearance.POSITIVE
		);

		isSyncEnabled = response.isSyncEnabled;
	};

	const frequencyOptions = Object.values(EventFrequency).map((value) => ({
		label: value
	}));

	onMount(async () => {
		settings.forEach((setting) => {
			if (!setting) return;
			switch (setting.name) {
				case SyncSettings.SYNC_ENABLED:
					isSyncEnabled = setting.value === '1' ? true : false;
					break;
				case SyncSettings.SYNC_URL:
					canutinFileUrlValue = setting.value;
					break;
				case SyncSettings.SYNC_FREQUENCY:
					frequencyValue = parseInt(setting.value);
					break;
				case SyncSettings.SYNC_COOKIE:
					cookieValue = setting.value;
					break;
				case SyncSettings.SYNC_JWT:
					jwtValue = setting.value;
					break;
			}
		});
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Sync settings">
		<div slot="CONTENT" class="import">
			<Form on:submit={handleSyncForm}>
				<FormFieldset>
					<FormField name="status" label="Sync status">
						<FormNotice>
							<FormNoticeNotice
								appearance={isSyncEnabled ? Appearance.POSITIVE : Appearance.WARNING}
							>
								<FormNoticeP>
									<strong>Sync is {isSyncEnabled ? 'enabled' : 'disabled'}</strong>
								</FormNoticeP>
								{#if !isSyncEnabled}
									<FormNoticeP>
										Enable syncing by providing a URL that can be fetched as a CanutinFile JSON
										payload. On every sync the vault will be updated with any new data found,
										duplicates will be ignored.
									</FormNoticeP>
								{/if}
							</FormNoticeNotice>
						</FormNotice>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="canutinFileUrl" label="CanutinFile URL">
						<FormInput
							name="canutinFileUrl"
							placeholder="https://example.com/my-scraper/canutinFile.json"
							bind:value={canutinFileUrlValue}
						/>
					</FormField>
					<FormField name="cookie" label="Cookie" optional={true}>
						<FormInput
							required={false}
							name="cookie"
							type="password"
							placeholder="accessToken=1234abc; userId=1234; Path=/; HttpOnly;"
							value={cookieValue}
						/>
					</FormField>
					<FormField name="jwt" label="JSON Web Token" optional={true}>
						<FormInput
							type="password"
							required={false}
							name="jwt"
							value={jwtValue}
							placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
						/>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="frequency" label="Auto-sync">
						<FormSelect name="frequency" options={frequencyOptions} bind:value={frequencyValue} />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE} disabled={!canutinFileUrlValue}
						>{isSyncEnabled ? 'Update' : 'Enable'}</Button
					>
				</FormFooter>
			</Form>
		</div>
	</Section>

	<Section title="From API">
		<div slot="CONTENT">
			<Notice>
				Submit a <Code>POST</Code> request to
				<Code>{$page.url}.json</Code> with a CanutinFile payload
			</Notice>
		</div>
	</Section>

	{@const error = noFileError || importSummary?.error}
	<Section title="From file">
		<div slot="CONTENT" class="import">
			<Form on:submit={handleFileForm}>
				<FormFieldset>
					<FormField name="file" label="CanutinFile">
						<FormInput type="file" name="file" accept=".json" />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE}>Upload</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>

	{#if !isImportLoading && !error && importSummary}
		<div class="importStatus">
			<div class="importStatus__model">
				<Section title="Accounts">
					<div slot="CONTENT" class="importSummary" data-test-id="accounts-import-summary">
						{@const createdAccounts = importSummary?.importedAccounts?.created.length || 0}
						<Card
							title="Created"
							appearance={createdAccounts == 0 ? CardAppearance.SECONDARY : undefined}
							value={createdAccounts}
						/>

						{@const updatedAccounts = importSummary?.importedAccounts?.updated.length || 0}
						<Card
							title="Updated"
							appearance={updatedAccounts == 0 ? CardAppearance.SECONDARY : undefined}
							value={updatedAccounts}
						/>
					</div>
				</Section>

				<Section title="Accounts balance statements">
					<div slot="CONTENT" class="importSummary">
						{@const createdAccountBalances =
							importSummary?.importedAccounts?.balanceStatements.created.length || 0}
						<Card
							title="Created"
							appearance={createdAccountBalances == 0 ? CardAppearance.SECONDARY : undefined}
							value={createdAccountBalances}
						/>

						{@const skippedAccountBalances =
							importSummary?.importedAccounts?.balanceStatements.skipped.length || 0}
						<Card
							title="Duplicates (Skipped)"
							appearance={skippedAccountBalances == 0 ? CardAppearance.SECONDARY : undefined}
							value={skippedAccountBalances}
						/>

						{#if skippedAccountBalances > 0}
							<code class="importSummary__code">
								<pre class="importSummary__pre">// Duplicates</pre>
								{JSON.stringify(importSummary?.importedAccounts?.balanceStatements.skipped)}
							</code>
						{/if}
					</div>
				</Section>

				<Section title="Accounts transactions">
					<div slot="CONTENT" class="importSummary">
						{@const createdTransactions =
							importSummary?.importedAccounts?.transactions.created.length || 0}
						<Card
							title="Created"
							appearance={createdTransactions == 0 ? CardAppearance.SECONDARY : undefined}
							value={createdTransactions}
						/>

						{@const skippedTransactions =
							importSummary?.importedAccounts?.transactions.skipped.length || 0}
						<Card
							title="Duplicates (Skipped)"
							appearance={skippedTransactions == 0 ? CardAppearance.SECONDARY : undefined}
							value={skippedTransactions}
						/>

						{#if skippedTransactions > 0}
							<code class="importSummary__code">
								<pre class="importSummary__pre">// Duplicates</pre>
								{JSON.stringify(importSummary?.importedAccounts?.transactions.skipped)}
							</code>
						{/if}
					</div>
				</Section>
			</div>

			<div class="importStatus__model">
				<Section title="Assets">
					<div slot="CONTENT" class="importSummary" data-test-id="assets-import-summary">
						{@const createdAssets = importSummary?.importedAssets?.created.length || 0}
						<Card
							title="Created"
							appearance={createdAssets == 0 ? CardAppearance.SECONDARY : undefined}
							value={createdAssets}
						/>

						{@const updatedAssets = importSummary?.importedAssets?.updated.length || 0}
						<Card
							title="Updated"
							appearance={updatedAssets == 0 ? CardAppearance.SECONDARY : undefined}
							value={updatedAssets}
						/>
					</div>
				</Section>

				<Section title="Assets balance statements">
					<div slot="CONTENT" class="importSummary">
						{@const createdAssetBalances =
							importSummary?.importedAssets?.balanceStatements.created.length || 0}
						<Card
							title="Created"
							appearance={createdAssetBalances == 0 ? CardAppearance.SECONDARY : undefined}
							value={createdAssetBalances}
						/>

						{@const skippedAssetBalances =
							importSummary?.importedAssets?.balanceStatements.skipped.length || 0}
						<Card
							title="Duplicates (Skipped)"
							appearance={skippedAssetBalances == 0 ? CardAppearance.SECONDARY : undefined}
							value={skippedAssetBalances}
						/>

						{#if skippedAssetBalances > 0}
							<code class="importSummary__code">
								<pre class="importSummary__pre">// Duplicates</pre>
								{JSON.stringify(importSummary?.importedAssets?.balanceStatements.skipped)}
							</code>
						{/if}
					</div>
				</Section>
			</div>
		</div>
	{/if}
</ScrollView>

<style lang="scss">
	div.import {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
	}

	div.importStatus {
		display: grid;
		grid-auto-flow: column;
		column-gap: 64px;
		width: 100%;
	}

	div.importStatus__model {
		display: flex;
		flex-direction: column;
		row-gap: 32px;
	}

	div.importSummary {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 8px;
	}

	code.importSummary__code {
		display: block;
		grid-column: span 2;
		background-color: var(--color-grey10);
		font-family: var(--font-monospace);
		font-size: 12px;
		padding: 16px;
		border-radius: 4px;
		word-wrap: break-word;
		max-height: 256px;
		overflow: auto;
	}

	pre.importSummary__pre {
		font-family: inherit;
		margin-top: 0;
		color: var(--color-grey50);
	}
</style>
