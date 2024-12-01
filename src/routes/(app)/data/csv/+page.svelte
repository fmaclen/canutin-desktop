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
		return csvData
			.filter((row) => row[columnMapping.date])
			.map((row) => {
				return {
					date: handleDateField(row[columnMapping.date] as string),
					description: row[columnMapping.description] as string,
					tag: row[columnMapping.tag] as string,
					value: handleValueField(row),
					import: JSON.stringify(row)
				};
			});
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
		return value;
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
		return date !== undefined && description !== undefined && value !== undefined;
	}

	function resetImport() {
		file = null;
		csvData = [];
		csvHeaders = [];
		errorMessage = null;
		wasSuccessful = false;
	}
</script>

<Head title="Import transactions from CSV" />

<h1>Import transactions from CSV</h1>

<div class="field">
	<label for="file">File</label>
	<input type="file" id="file" accept=".csv" bind:value={file} onchange={handleFileChange} />
</div>

<div class="field">
	<label for="accountColumn">Account</label>
	<select id="accountColumn" bind:value={columnMapping.account} disabled={!csvHeaders.length}>
		{#each accountsStore.accounts as account}
			<option value={account.id}>{account.name}</option>
		{/each}
	</select>
</div>

<h2>Mapping columns</h2>

{#snippet headerOptions()}
	<option value=""></option>
	{#each csvHeaders as header}
		<option value={header}>{header}</option>
	{/each}
{/snippet}

<div class="field">
	<label for="dateColumn">Date</label>
	<select id="dateColumn" bind:value={columnMapping.date} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</select>
</div>

<div class="field">
	<label for="descriptionColumn">Description</label>
	<select
		id="descriptionColumn"
		bind:value={columnMapping.description}
		disabled={isMappingFieldDisabled}
	>
		{@render headerOptions()}
	</select>
</div>

<div class="field">
	<label for="valueColumn">Amount</label>

	<input
		type="checkbox"
		id="useCreditDebitColumns"
		bind:checked={useCreditDebitColumns}
		disabled={isMappingFieldDisabled}
	/>
	<label for="useCreditDebitColumns">Credits and debits are in separate columns</label>
	{#if useCreditDebitColumns}
		<div>
			<label for="creditColumn">Credits</label>
			<select id="creditColumn" bind:value={creditColumn} disabled={isMappingFieldDisabled}>
				{@render headerOptions()}
			</select>
		</div>
		<div>
			<label for="debitsColumn">Debits</label>
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
	<label for="tagColumn">Tag (optional)</label>
	<select id="tagColumn" bind:value={columnMapping.tag} disabled={isMappingFieldDisabled}>
		{@render headerOptions()}
	</select>
</div>

<h2>Columns preview</h2>

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
			<tr style={isTransactionImportable(transaction) ? 'background-color: aquamarine;' : ''}>
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
				<td colspan={transactionFields.length}>No data to preview</td>
			</tr>
		{/each}
	</tbody>
</table>

<h3>Transactions found in file: {previewTransactions.length}</h3>
<h3>Transactions that can be imported: {importTransactions.length}</h3>

{#if errorMessage}
	<p class="error">{errorMessage}</p>
{/if}

{#if wasSuccessful}
	<p class="success">Import successful</p>
	<button onclick={resetImport}>New import</button>
	<a href="/balance-sheet">Balance sheet</a>
{:else}
	<button
		onclick={importData}
		disabled={!importTransactions.length || isImporting || wasSuccessful}
	>
		Import
	</button>
{/if}

<style>
	.error {
		color: tomato;
	}

	.success {
		color: seagreen;
	}
</style>
