<script lang="ts">
	import { format } from 'date-fns';
	import Papa from 'papaparse';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import Head from '$lib/components/Head.svelte';
	import { createTransactions } from '$lib/pocketbase';
	import type { TransactionsRecord } from '$lib/pocketbase-types';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { TransactionDetails } from '$lib/seed/data/transactions';
	import { dateInUTC, formatCurrency } from '$lib/utils';

	const pbClient = getPbClientContext();
	let file: File | null = $state(null);
	let csvData: any[] = $state([]);
	let csvHeaders: string[] = $state([]);

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

	let useDualValueColumns = $state(false);
	let positiveValueColumn = $state('');
	let negativeValueColumn = $state('');
	let isImporting = $state(false);

	const accountsStore = getAccountsContext();

	const transactionFields: (keyof TransactionsRecord)[] = [
		'date',
		'description',
		'value',
		'tag',
		'account'
	];

	const hasNoHeaders = $derived(!csvHeaders.length);

	interface PreviewTransaction {
		date?: Date;
		description?: string;
		value?: number;
		tag?: string;
	}

	const previewTransactions: PreviewTransaction[] = $derived.by(() => {
		return csvData.map((row) => {
			return {
				date: handleDateField(row[columnMapping.date]),
				description: row[columnMapping.description],
				value: handleValueField(row),
				tag: row[columnMapping.tag]
			};
		});
	});

	const importTransactions: TransactionDetails[] = $derived.by(() => {
		return previewTransactions
			.filter((transaction): transaction is Required<TransactionDetails> =>
				isTransactionImportable(transaction)
			)
			.map((transaction) => {
				return {
					date: transaction.date,
					description: transaction.description,
					value: transaction.value,
					tag: transaction?.tag
				};
			});
	});

	function handleFileChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files) {
			file = input.files[0];
			if (!file) return;

			Papa.parse(file, {
				complete: (results) => {
					csvData = results.data;
					csvHeaders = results.meta.fields ?? [];
				},
				header: true
			});
		}
	}

	function handleDateField(date: string): Date | undefined {
		if (!date) return undefined;
		return dateInUTC(new Date(date));
	}

	function formatValueField(value: string, isNegative: boolean = false): number | undefined {
		if (!value) return undefined;
		let parsedValue = value ? parseFloat(value.replace(/[^\d.-]/g, '')) : 0;
		if (isNegative) parsedValue = parsedValue * -1;
		return parsedValue;
	}

	function handleValueField(row: any) {
		let value: number | undefined = undefined;
		if (useDualValueColumns) value = formatValueField(row[positiveValueColumn]);
		if (useDualValueColumns && !value) value = formatValueField(row[negativeValueColumn], true);
		if (!useDualValueColumns) value = formatValueField(row[columnMapping.value]);
		return value;
	}

	async function importData() {
		if (!importTransactions.length) return;
		isImporting = true;
		await createTransactions(pbClient.pb, columnMapping.account, importTransactions);
		isImporting = false;
	}

	function isTransactionImportable(transaction: PreviewTransaction): boolean {
		const { date, description, value } = transaction;
		return date !== undefined && description !== undefined && value !== undefined;
	}
</script>

<Head title="Import transactions from CSV" />

<h1>Import transactions from CSV</h1>

<div class="field">
	<label for="file">File</label>
	<input type="file" id="file" accept=".csv" onchange={handleFileChange} />
</div>

<div class="field">
	<label for="accountColumn">Account</label>
	<select id="accountColumn" bind:value={columnMapping.account} disabled={hasNoHeaders}>
		{#each accountsStore.accounts as account}
			<option value={account.id}>{account.name}</option>
		{/each}
	</select>
</div>

<h2>Mapping columns</h2>

<div class="field">
	<label for="dateColumn">Date</label>
	<select id="dateColumn" bind:value={columnMapping.date} disabled={hasNoHeaders}>
		{#each csvHeaders as header}
			<option value={header}>{header}</option>
		{/each}
	</select>
</div>

<div class="field">
	<label for="descriptionColumn">Description</label>
	<select id="descriptionColumn" bind:value={columnMapping.description} disabled={hasNoHeaders}>
		{#each csvHeaders as header}
			<option value={header}>{header}</option>
		{/each}
	</select>
</div>

<div class="field">
	<label for="valueColumn">Amount</label>
	<input
		type="checkbox"
		id="useDualValueColumns"
		bind:checked={useDualValueColumns}
		disabled={hasNoHeaders}
	/>
	<label for="useDualValueColumns">Positive and negative amounts are in separate columns</label>
	{#if useDualValueColumns}
		<div>
			Positive value:
			<select id="positiveValueColumn" bind:value={positiveValueColumn} disabled={hasNoHeaders}>
				{#each csvHeaders as header}
					<option value={header}>{header}</option>
				{/each}
			</select>
		</div>
		<div>
			Negative value:
			<select id="negativeValueColumn" bind:value={negativeValueColumn} disabled={hasNoHeaders}>
				{#each csvHeaders as header}
					<option value={header}>{header}</option>
				{/each}
			</select>
		</div>
	{:else}
		<br />
		<select id="valueColumn" bind:value={columnMapping.value} disabled={hasNoHeaders}>
			{#each csvHeaders as header}
				<option value={header}>{header}</option>
			{/each}
		</select>
	{/if}
</div>

<div class="field">
	<label for="tagColumn">Tag (optional)</label>
	<select id="tagColumn" bind:value={columnMapping.tag} disabled={hasNoHeaders}>
		{#each csvHeaders as header}
			<option value={header}>{header}</option>
		{/each}
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
							{transaction.value ? formatCurrency(transaction.value) : '~'}
						{:else if field === 'account' && columnMapping.account}
							{@const account = accountsStore.accounts.find((account) => account.id === columnMapping.account)}
							{account ? account.name : '~'}
						{:else}
							{(transaction[field as keyof PreviewTransaction] as any) || '~'}
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

<button onclick={importData} disabled={hasNoHeaders}>Import Data</button>
