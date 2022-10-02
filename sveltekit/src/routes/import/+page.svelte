<script lang="ts">
	import { page } from '$app/stores';

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
	import { Appearance, EventFrequency, ImportFunctions } from '$lib/helpers/constants';
	import type { ImportSummary } from '../import.json/+server';

	const title = 'Import CanutinFile';

	let isLoading: boolean = false;
	let noFileError: string | undefined = undefined;
	let importSummary: ImportSummary | undefined = undefined;

	const handleFileForm = (event: any) => {
		importSummary = undefined; // Reset the previous import summary (if any)

		const chosenFile = event.target.file.files[0];
		if (!chosenFile) {
			noFileError = 'No file was chosen';
			return;
		}

		// Set the loading state
		isLoading = true;
		$statusBarStore = {
			message: 'Processing import...',
			appearance: Appearance.ACTIVE
		};

		const reader = new FileReader();
		reader.onload = async (event: ProgressEvent<FileReader>) => {
			const canutinFile = JSON.parse(event?.target?.result as string);
			importSummary = await api({ endpoint: 'import', method: 'POST', payload: canutinFile });

			// Update the loading state
			isLoading = false;
			$statusBarStore = {
				message: importSummary?.error ? importSummary.error : 'Import was successful',
				appearance: importSummary?.error ? Appearance.NEGATIVE : Appearance.POSITIVE
			};
		};

		reader.readAsText(chosenFile);
	};

	// Sync
	const handleSyncForm = async (event: any) => {
		const canutinFileUrl = event.target.canutinFileUrl?.value;
		const frequency = event.target.frequency?.value;
		const cookie = event.target.cookie?.value;
		const jwt = event.target.jwt?.value;

		const payload: ImportPayload = {
			function: ImportFunctions.SYNC_URL,
			urlSync: {
				canutinFileUrl,
				frequency,
				cookie,
				jwt
			}
		};

		const response = await api({
			endpoint: 'import',
			method: 'POST',
			payload: payload
		});
	};

	const frequencyOptions = Object.values(EventFrequency).map((value) => ({
		label: value
	}));

	$: frequencyValue = 0; // "0" == Never
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Sync">
		<div slot="CONTENT" class="import">
			<Form on:submit={handleSyncForm}>
				<FormFieldset>
					<FormField name="canutinFileUrl" label="CanutinFile URL">
						<FormNotice>
							<FormInput
								name="canutinFileUrl"
								placeholder="https://example.com/my-scraper/canutinFile.json"
							/>
							<FormNoticeNotice appearance={Appearance.WARNING}>
								<FormNoticeP>
									<strong>Sync is disabled</strong>
								</FormNoticeP>
								<FormNoticeP>
									Enable syncing by providing a URL that can be fetched as a CanutinFile JSON
									payload. The vault will be updated with any new data found on every sync
								</FormNoticeP>
							</FormNoticeNotice>
						</FormNotice>
					</FormField>
					<FormField name="cookie" label="Cookie" optional={true}>
						<FormInput
							required={false}
							name="cookie"
							placeholder="accessToken=1234abc; userId=1234"
						/>
					</FormField>
					<FormField name="jwt" label="JSON Web Token" optional={true}>
						<FormInput type="password" required={false} name="jwt" />
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="frequency" label="Auto-sync">
						<FormSelect name="frequency" options={frequencyOptions} bind:value={frequencyValue} />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE}>Apply</Button>
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

	{#if !isLoading && !error && importSummary}
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
