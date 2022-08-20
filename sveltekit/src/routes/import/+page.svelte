<script lang="ts">
	import { page } from '$app/stores';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import { CardAppearance } from '$lib/components/Card';
	import type { ImportSummary } from '../import.json/+server';

	const title = 'Import data';

	let isLoading: boolean = false;
	let noFileError: string | undefined = undefined;
	let importSummary: ImportSummary | undefined = undefined;

	const submitForm = (event: any) => {
		event.preventDefault();
		importSummary = undefined; // Reset the previous import summary (if any)

		const chosenFile = event.target.file.files[0];
		if (!chosenFile) {
			noFileError = 'No file was chosen';
			return;
		}

		isLoading = true;
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
			isLoading = false;
		};

		reader.readAsText(chosenFile);
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="From API">
		<div slot="CONTENT">
			<Notice>
				Submit a <code class="code">POST</code> request to
				<code class="code">{$page.url}.json</code> with a CanutinFile payload
			</Notice>
		</div>
	</Section>

	{@const error = noFileError || importSummary?.error}
	<Section title="Manually">
		<div slot="CONTENT" class="importForm">
			<form class="form" on:submit={submitForm}>
				<fieldset class="form__fieldset">
					<div class="form__field">
						<label class="form__label" for="file">CanutinFile</label>
						<FormInput type="file" name="file" accept=".json" />
					</div>
				</fieldset>
				<footer class="form__footer">
					<Button>Upload</Button>
				</footer>
			</form>

			{#if isLoading}
				<Notice>Processing import...</Notice>
			{/if}

			{#if error}
				<Notice isError={true}>{error}</Notice>
			{/if}
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
	div.importForm {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
	}

	form.form {
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: grid;
	}

	fieldset.form__fieldset {
		border: none;
		padding: 12px 0;
		display: grid;
		grid-row-gap: 8px;
		margin: 0;
	}

	div.form__field {
		display: grid;
		grid-template-columns: 1.25fr 2fr 0.75fr;
		column-gap: 20px;
	}

	label.form__label {
		display: flex;
		margin-left: auto;
		align-items: center;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--color-grey70);
	}

	footer.form__footer {
		display: flex;
		justify-content: flex-end;
		padding: 8px 12px;
		background-color: var(--color-border);
	}

	code.code {
		margin-left: 6px;
		margin-right: 6px;
		padding: 4px;
		border-radius: 4px;
		font-size: 12px;
		font-family: var(--font-monospace);
		color: var(--color-grey70);
		background-color: var(--color-grey7);
	}

	div.importStatus {
		display: grid;
		grid-auto-flow: column;
		column-gap: 64px;
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