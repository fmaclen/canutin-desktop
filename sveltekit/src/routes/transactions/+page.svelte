<script lang="ts">
	import { slide } from 'svelte/transition';
	import {
		subMonths,
		subYears,
		startOfMonth,
		endOfMonth,
		startOfYear,
		endOfYear,
		fromUnixTime,
		format
	} from 'date-fns';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import Card from '$lib/components/Card.svelte';
	import Link from '$lib/components/Link.svelte';
	import { api } from '$lib/helpers/misc';
	import { CardAppearance } from '$lib/components/Card';
	import { dateInUTC, formatCurrency, formatInUTC } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import type { TransactionResponse } from '../transactions.json/+server';

	const title = 'Transactions';

	const today = new Date();
	const thisMonthFrom = startOfMonth(today);
	const thisMonthTo = endOfMonth(today);
	const thisYearFrom = startOfYear(today);
	const thisYearTo = endOfYear(today);
	const periods = [
		{
			label: 'This month',
			dateFrom: thisMonthFrom,
			dateTo: thisMonthTo
		},
		{
			label: 'Last month',
			dateFrom: subMonths(thisMonthFrom, 1),
			dateTo: subMonths(thisMonthTo, 1)
		},
		{
			label: 'Last 3 months',
			dateFrom: subMonths(thisMonthTo, 3),
			dateTo: thisMonthTo
		},
		{
			label: 'Last 6 months',
			dateFrom: subMonths(thisMonthTo, 6),
			dateTo: thisMonthTo
		},
		{
			label: 'Last 12 months',
			dateFrom: subMonths(thisMonthTo, 12),
			dateTo: thisMonthTo
		},
		{
			label: 'Year to date',
			dateFrom: thisYearFrom,
			dateTo: thisYearTo
		},
		{
			label: 'Last year',
			dateFrom: subYears(thisYearFrom, 1),
			dateTo: subYears(thisYearTo, 1)
		},
		{
			label: 'Lifetime',
			dateFrom: subYears(thisYearTo, 900), // FIXME: should be the earliest transaction date
			dateTo: thisYearTo // FIXME: should be the latest transaction date
		}
	];

	enum Filter {
		ALL = 'All',
		CREDITS = 'Credits',
		DEBITS = 'Debits'
	}

	const TABLE_HEADERS = [
		{
			label: 'Date',
			column: 'date'
		},
		{
			label: 'Description',
			column: 'description'
		},
		{
			label: 'Category',
			column: 'categoryId'
		},
		{
			label: 'Account',
			column: 'accountId'
		},
		{
			label: 'Amount',
			column: 'value'
		}
	];

	// Default params
	$: transactions = [] as TransactionResponse[];
	$: filteredTransactions = [] as TransactionResponse[];
	$: filterBy = Filter.ALL;

	$: periodIndex = 2; // Last 3 months
	$: dateFrom = format(dateInUTC(periods[periodIndex].dateFrom), 'yyyy-MM-dd');
	$: dateTo = format(dateInUTC(periods[periodIndex].dateTo), 'yyyy-MM-dd');

	$: sortBy = TABLE_HEADERS[0].column; // Date column
	$: sortOrder = SortOrder.DESC;
	$: keyword = '';

	const getTransactions = async () => {
		const params = [
			`dateFrom=${dateFrom}`,
			`dateTo=${dateTo}`,
			`sortBy=${sortBy}`,
			`sortOrder=${sortOrder}`,
			`keyword=${keyword}`
		];
		const data = await api({ endpoint: 'transactions', method: 'GET', params: params.join('&') });

		transactions = data.transactions;
		setFilterBy(filterBy);
	};

	// When the component is mounted retrieve transactions with the default params
	onMount(async () => {
		await getTransactions();
	});

	// Sorts the transactions by column and asc/desc order
	const sortTransactionsBy = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}
		await getTransactions();
	};

	// Sum the total from all the transaction values (ignoring "excluded" ones)
	const sumTransactions = (transactions: TransactionResponse[]) => {
		return transactions.reduce((acc, transaction) => {
			return transaction.isExcluded ? acc : acc + transaction.value;
		}, 0);
	};

	// Filters transactions by their positive or negative value
	const setFilterBy = (filter: Filter) => {
		filterBy = filter ? filter : filterBy;

		if (filter === Filter.ALL) {
			filteredTransactions = transactions;
		} else {
			filteredTransactions = transactions.filter((transaction) =>
				filter === Filter.CREDITS ? transaction.value >= 0 : transaction.value < 0
			);
		}
	};

	// Highlight the transaction after it's created or updated
	const highlightParam = $page.url.searchParams.get('highlight');
	let highlight = highlightParam ? parseInt(highlightParam) : undefined;
	let selectedTransactions: number[] = [];

	$: allSelected = transactions.length > 0 && transactions.length === selectedTransactions.length;
	$: someSelected =
		transactions.length > selectedTransactions.length && selectedTransactions.length > 0;
	$: if (highlight && selectedTransactions.includes(highlight)) highlight = undefined; // Reset highlight when selecting transactions

	const toggleSelectTransactions = () => {
		selectedTransactions = allSelected ? [] : transactions.map((transaction) => transaction.id);
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<nav slot="NAV">
		<Link href="/transaction/add">Add transaction</Link>
		<Link href="/import">Import</Link>
	</nav>
	<Section title="Browse transactions">
		<div slot="HEADER">
			<SegmentedControl
				segments={Object.values(Filter)}
				currentSegment={filterBy}
				callback={setFilterBy}
			/>
		</div>

		<div slot="CONTENT" class="transactions">
			<header class="transactions__header">
				<FormInput
					type="text"
					name="keyword"
					placeholder="Type to filter by description, amount, category or account"
					bind:value={keyword}
					on:keyup={async () => await getTransactions()}
				/>
				<FormSelect
					name="periods"
					options={periods}
					bind:value={periodIndex}
					on:change={async () => {
						await getTransactions();
					}}
				/>
				<div class="transactions__summary">
					<Card
						appearance={CardAppearance.SECONDARY}
						title="Transactions"
						value={filteredTransactions?.length}
					/>
					<Card
						appearance={CardAppearance.SECONDARY}
						title="Net balance"
						value={formatCurrency(sumTransactions(filteredTransactions), 2, 2)}
					/>
				</div>
			</header>

			{#if selectedTransactions.length > 0}
				<nav class="batchEditor" transition:slide|local>
					<em class="batchEditor__em">{selectedTransactions.length} transactions selected</em>
					—
					<Link href={`/transaction/batch/${selectedTransactions.join('-')}`}>Edit together</Link>
				</nav>
			{/if}

			<table class="table">
				<thead>
					<tr>
						<th class="table__th table__th--checkbox">
							<label class="batchEditor-checkbox">
								<input
									name="toggleSelectAll"
									type="checkbox"
									on:click={toggleSelectTransactions}
									checked={allSelected}
									indeterminate={someSelected}
									class="batchEditor-checkbox__input"
								/>
							</label>
						</th>

						{#each TABLE_HEADERS as tableHeader}
							{@const { label, column } = tableHeader}
							<th
								class="table__th {tableHeader.label === TABLE_HEADERS[4].label &&
									'table__th--total'}"
							>
								<button
									class="table__sortable
									{sortBy === column && 'table__sortable--active'}
									{sortBy === column && `table__sortable--${sortOrder}`}"
									on:click={async () => await sortTransactionsBy(column)}
								>
									{label}
								</button>
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if filteredTransactions?.length > 0}
						{#each filteredTransactions as transaction}
							{@const { id, date, description, transactionCategory, account, value, isExcluded } =
								transaction}
							<tr
								class="table__tr
									{highlight === id || selectedTransactions.includes(id) ? 'table__tr--highlight' : null}"
							>
								<td class="table__td table__td--checkbox">
									<label class="batchEditor-checkbox">
										<input
											bind:group={selectedTransactions}
											checked={selectedTransactions.includes(id)}
											name={transaction.id.toString()}
											value={transaction.id}
											type="checkbox"
											class="batchEditor-checkbox__input"
										/>
									</label>
								</td>

								<td class="table__td table__td--date">
									{formatInUTC(fromUnixTime(date), 'MMM dd, yyyy')}
								</td>
								<td class="table__td"><Link href={`/transaction/${id}`}>{description}</Link></td>
								<td class="table__td">{transactionCategory.name}</td>
								<td class="table__td">
									<Link href={`/account/${transaction.accountId}`}>{account.name}</Link>
								</td>
								<td class="table__td table__td--total {value > 0 && `table__td--positive`}">
									<span
										class={isExcluded ? `table__excluded` : null}
										title={isExcluded
											? "This transaction is excluded from 'The big picture' and 'Balance sheet' totals"
											: null}
									>
										{formatCurrency(value, 2, 2)}
									</span>
								</td>
							</tr>
						{/each}
					{:else}
						<tr class="table__tr">
							<td class="table__td table__td--notice" colspan="999">No transactions found</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.transactions {
		background-color: var(--color-white);
		box-shadow: var(--box-shadow);
		border-radius: 4px;
	}

	header.transactions__header {
		display: grid;
		grid-template-columns: 4fr 1fr;
		grid-template-rows: 1fr;
		gap: 8px;
		border-radius: 4px 4px 0 0;
		background-color: var(--color-grey3);
		border-bottom: 1px solid var(--color-border);
		padding: 16px;
	}

	div.transactions__summary {
		display: grid;
		grid-auto-flow: column;
		column-gap: 8px;
		grid-column: span 2;
	}

	table.table {
		position: relative;
		z-index: 1;
		width: 100%;
		table-layout: auto;
		border-collapse: collapse;
		font-size: 12px;
	}

	th.table__th {
		color: var(--color-grey40);
		font-weight: 400;
		padding: 16px 16px 16px 0;
		position: sticky;
		top: 0;
		z-index: 1;
		box-shadow: inset 0 -2px 0 var(--color-grey10);
		background-color: #fff;
		text-align: left;
		box-sizing: border-box;

		&:first-child {
			padding-left: 16px;
		}

		&:last-child {
			padding-right: 16px;
		}

		&--checkbox,
		&--checkbox:first-child {
			padding: unset;
			width: max-content;
		}

		&--total {
			text-align: right;
		}
	}

	button.table__sortable {
		border: none;
		padding: 0;
		background-color: transparent;
		color: var(--color-grey40);
		text-decoration: none;
		cursor: pointer;

		&:hover,
		&:hover::after {
			color: var(--color-bluePrimary);
		}

		&--active {
			color: var(--color-grey80);
			font-weight: 600;
		}

		&--asc,
		&--desc {
			&::after {
				position: relative;
				display: inline-block;
				padding-left: 4px;
				font-size: 8px;
				color: var(--color-grey70);
				line-height: 1em;
			}
		}

		&--asc::after {
			content: '▲';
		}

		&--desc::after {
			content: '▼';
		}
	}

	tr.table__tr {
		border-bottom: 1px dashed var(--color-border);
		vertical-align: top;

		&:nth-child(odd) {
			td.table__td {
				background-color: var(--color-grey3);
			}
		}

		&:last-child {
			border-bottom: none;

			td.table__td:first-child {
				border-bottom-left-radius: 4px;
			}

			td.table__td:last-child {
				border-bottom-right-radius: 4px;
			}
		}

		&:hover,
		&--highlight {
			&:nth-child(even),
			&:nth-child(odd) {
				td.table__td:not(.table__td--notice) {
					background-color: var(--color-blueSecondary);
				}
			}
		}
	}

	td.table__td {
		font-size: 12px;
		padding: 12px 16px 12px 0;
		color: var(--color-grey80);

		&:first-child:not(.table__td--notice) {
			padding-left: 16px;
		}

		&--checkbox,
		&--checkbox:first-child:not(.table__td--notice) {
			padding: unset;
			width: max-content;
		}

		&--date {
			font-family: var(--font-monospace);
			text-transform: uppercase;
			font-size: 11px;
			line-height: 16px;
		}

		&--total {
			font-family: var(--font-monospace);
			text-align: right;
			line-height: 16px;
		}

		&--positive {
			color: var(--color-greenPrimary);
		}

		&--notice {
			text-align: center;
			padding: 32px;
			background-color: var(--color-grey5);
			color: var(--color-grey50);
		}
	}

	span.table__excluded {
		display: inline-block;
		color: var(--color-grey40);
		border-bottom: 1px dashed var(--color-grey10);
		cursor: help;
	}

	// Batch-editor
	nav.batchEditor {
		display: flex;
		gap: 8px;
		font-size: 12px;
		padding: 16px;
		color: var(--color-grey20);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-blueSecondary);
	}

	em.batchEditor__em {
		color: var(--color-bluePrimary);
		font-style: unset;
	}

	label.batchEditor-checkbox {
		display: flex;
		height: 100%;
		padding: 12px 16px;
	}

	input.batchEditor-checkbox__input {
		margin: 0;
	}
</style>
