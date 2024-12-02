<script lang="ts">
	import { format } from 'date-fns';
	import Papa from 'papaparse';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import Head from '$lib/components/Head.svelte';
	import { createTransactions } from '$lib/pocketbase';
	import type { TransactionsRecord } from '$lib/pocketbase-types';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { TransactionDetails } from '$lib/seed/data/transactions';
	import { formatCurrency, utcDateInLocalTimezone } from '$lib/utils';
	import LL from '$i18n/i18n-svelte';

	const pbClient = getPbClientContext();
	let file: File | null = $state(null);
	let csvData: Record<string, string | number | null>[] = $state([]);
	let csvHeaders: string[] = $state([]);
	let errorMessage = $state<string | null>(null);
	let isImporting = $state(false);
	let wasSuccessful = $state(false);

	let columnMapping: Record<keyof TransactionsRecord, string> = $state({
		date: '',
		description: '',
		value: '',
		isExcluded: '',
		isPending: '',
		tag: '',
		account: '',
		import: ''
	});

	let useCreditDebitColumns = $state(false);
	let creditColumn = $state('');
	let debitColumn = $state('');

	const accountsStore = getAccountsContext();

	const transactionFields: (keyof TransactionsRecord)[] = [
		'date',
		'description',
		'value',
		'tag',
		'account'
	];

	const isMappingFieldDisabled = $derived(!csvHeaders.length || !columnMapping.account);

	interface PreviewTransaction {
		date?: Date;
		description?: string;
		value?: number;
		tag?: string;
		import: string;
	}

	const previewTransactions: PreviewTransaction[] = $derived.by(() => {
		return (
			csvData
				// Filter out CSV headers
				.filter((row) => Object.values(row).some((value) => value !== null && value !== ''))
				// Filter out rows where date or description are not set
				.filter((row) => row[columnMapping.date] || row[columnMapping.description])
				.map((row) => {
					return {
						date: handleDateField(row[columnMapping.date] as string),
						description: row[columnMapping.description] as string,
						tag: row[columnMapping.tag] as string,
						value: handleValueField(row),
						import: JSON.stringify(row)
					};
				})
		);
	});

	const importTransactions: TransactionDetails[] = $derived.by(() => {
		return previewTransactions.filter((transaction): transaction is Required<TransactionDetails> =>
			isTransactionImportable(transaction)
		);
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			file = input.files[0];
			if (!file) return;

			Papa.parse(file, {
				complete: (results) => {
					csvData = results.data as Record<string, string | number | null>[];
					csvHeaders = results.meta.fields ?? [];
				},
				header: true
			});
		}
	}

	function handleDateField(date: string): Date | undefined {
		if (!date) return undefined;
		const parsed = new Date(date);
		return utcDateInLocalTimezone(parsed);
	}

	function formatValueField(value: string, isNegative: boolean = false): number | undefined {
		if (!value) return undefined;
		let parsedValue = value ? parseFloat(value.replace(/[^\d.-]/g, '')) : 0;
		if (isNegative) parsedValue = parsedValue * -1;
		return parsedValue;
	}

	function handleValueField(row: Record<string, string | number | null>) {
		let value: number | undefined = undefined;
		if (useCreditDebitColumns) value = formatValueField(row[creditColumn] as string);
		if (useCreditDebitColumns && !value) value = formatValueField(row[debitColumn] as string, true);
		if (!useCreditDebitColumns) value = formatValueField(row[columnMapping.value] as string);
		return value ?? 0;
	}

	async function importData() {
		wasSuccessful = false;
		errorMessage = null;
		if (!importTransactions.length) return;
		try {
			isImporting = true;
			await createTransactions(pbClient.pb, columnMapping.account, importTransactions);
			wasSuccessful = true;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unknown error';
		} finally {
			isImporting = false;
		}
	}

	function isTransactionImportable(transaction: PreviewTransaction): boolean {
		const { date, description, value } = transaction;
		return !!date && !!description && !!value;
	}

	function resetImport() {
		file = null;
		csvData = [];
		csvHeaders = [];
		errorMessage = null;
		wasSuccessful = false;
	}
</script>

<Head title={$LL.IMPORT_TRANSACTIONS_FROM_CSV()} />

<h1>{$LL.IMPORT_TRANSACTIONS_FROM_CSV()}</h1>

<div class="field">
	<label for="file">{$LL.FILE()}</label>
	<input type="file" id="file" accept=".csv" bind:value={file} onchange={handleFileChange} />
</div>

<div class="field">
	<label for="accountColumn">{$LL.ACCOUNT()}</label>
	<select id="accountColumn" bind:value={columnMapping.account} disabled={!csvHeaders.length}>
		{#each accountsStore.accounts as account}
			<option value={account.id}>{account.name}</option>
		{/each}
	</select>
</div>

<h2>{$LL.MAPPING_COLUMNS()}</h2>

{#snippet headerOptions()}
	<option value=""></option>
	{#each csvHeaders as header}
		<option value={header}>{header}</option>
	{/each}
{/snippet}

<div class="field">
	<label for="dateColumn">{$LL.DATE()}</label>
	<select id="dateColumn" bind:value={columnMapping.date} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</select>
</div>

<div class="field">
	<label for="descriptionColumn">{$LL.DESCRIPTION()}</label>
	<select
		id="descriptionColumn"
		bind:value={columnMapping.description}
		disabled={isMappingFieldDisabled}
	>
		{@render headerOptions()}
	</select>
</div>

<div class="field">
	<label for="valueColumn">{$LL.AMOUNT()}</label>

	<input
		type="checkbox"
		id="useCreditDebitColumns"
		bind:checked={useCreditDebitColumns}
		disabled={isMappingFieldDisabled}
	/>
	<label for="useCreditDebitColumns">{$LL.CREDITS_DEBITS_SEPARATE()}</label>
	{#if useCreditDebitColumns}
		<div>
			<label for="creditColumn">{$LL.CREDITS()}</label>
			<select id="creditColumn" bind:value={creditColumn} disabled={isMappingFieldDisabled}>
				{@render headerOptions()}
			</select>
		</div>
		<div>
			<label for="debitsColumn">{$LL.DEBITS()}</label>
			<select id="debitsColumn" bind:value={debitColumn} disabled={isMappingFieldDisabled}>
				{@render headerOptions()}
			</select>
		</div>
	{:else}
		<div>
			<select id="valueColumn" bind:value={columnMapping.value} disabled={isMappingFieldDisabled}>
				{@render headerOptions()}
			</select>
		</div>
	{/if}
</div>

<div class="field">
	<label for="tagColumn">{$LL.TAG_OPTIONAL()}</label>
	<select id="tagColumn" bind:value={columnMapping.tag} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</select>
</div>

<h2>{$LL.COLUMNS_PREVIEW()}</h2>

<h3>{$LL.TRANSACTIONS_FOUND()}: {previewTransactions.length}</h3>
<h3>{$LL.TRANSACTIONS_IMPORTABLE()}: {importTransactions.length}</h3>

<table>
	<thead>
		<tr>
			{#each transactionFields as field}
				<th>{field}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each previewTransactions.slice(0, 5) as transaction}
			<tr class:success-bg={isTransactionImportable(transaction)}>
				{#each transactionFields as field}
					<td>
						{#if field === 'date'}
							{transaction.date ? format(transaction.date, 'MMM d, yyyy') : '~'}
						{:else if field === 'value' && transaction.value !== undefined}
							{transaction.value ? formatCurrency(transaction.value, 2) : '~'}
						{:else if field === 'account' && columnMapping.account}
							{@const account = accountsStore.accounts.find(
								(account) => account.id === columnMapping.account
							)}
							{account ? account.name : '~'}
						{:else}
							{(transaction[field as keyof PreviewTransaction] as string | number | null) || '~'}
						{/if}
					</td>
				{/each}
			</tr>
		{:else}
			<tr>
				<td colspan={transactionFields.length}>{$LL.NO_DATA_PREVIEW()}</td>
			</tr>
		{/each}
	</tbody>
</table>

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

{#if wasSuccessful}
	<p class="success">{$LL.IMPORT_SUCCESSFUL()}</p>
	<button onclick={resetImport}>{$LL.NEW_IMPORT()}</button>
	<a href="/balance-sheet">{$LL.REVIEW_IMPORT()}</a>
{:else}
	<button
		onclick={importData}
		disabled={!importTransactions.length || isImporting || wasSuccessful}
	>
		{$LL.IMPORT()}
	</button>
{/if}

<style>
	.error {
		color: tomato;
	}

	.success {
		color: seagreen;
	}

	.success-bg {
		color: white;
		background-color: seagreen;
	}
</style>
