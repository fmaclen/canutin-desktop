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
	import Card from '$lib/components/Card.svelte';
	import Link from '$lib/components/Link.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import { api } from '$lib/helpers/misc';
	import { CardAppearance } from '$lib/components/Card';
	import { dateInUTC, formatCurrency, formatInUTC } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import type { TransactionResponse } from '../transactions.json/+server';

	const title = 'Transactions';

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

	// Filter transactions by date range
	const today = new Date();
	const thisMonthFrom = startOfMonth(today);
	const thisMonthTo = endOfMonth(today);
	const thisYearFrom = startOfYear(today);
	const thisYearTo = endOfYear(today);
	let periods = [
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

	// Default params
	$: transactions = [] as TransactionResponse[];
	$: filteredTransactions = [] as TransactionResponse[];
	$: filterBy = Filter.ALL;

	// Transaction sorting and filtering
	$: sortBy = TABLE_HEADERS[0].column; // Date column
	$: sortOrder = SortOrder.DESC;
	$: keyword = '';

	$: periodIndex = 2; // Last 3 months
	$: dateFrom = format(dateInUTC(periods[periodIndex].dateFrom), 'yyyy-MM-dd');
	$: dateTo = format(dateInUTC(periods[periodIndex].dateTo), 'yyyy-MM-dd');

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

	// When the component is mounted retrieve transactions with the params set in
	// the URL or with default params if no params are present.
	onMount(async () => {
		const urlParams = new URLSearchParams(window.location.search);
		const periodLabel = urlParams.get('periodLabel');
		const periodFrom = urlParams.get('periodFrom');
		const periodTo = urlParams.get('periodTo');

		// Add a new period with the custom date range
		if (periodFrom && periodTo && periodLabel) {
			periods = [
				...periods,
				{
					label: periodLabel,
					dateFrom: dateInUTC(new Date(periodFrom)),
					dateTo: dateInUTC(new Date(periodTo))
				}
			];

			periodIndex = periods.length - 1;
			dateFrom = periodFrom;
			dateTo = periodTo;
		}

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
						// HACK: there is a race condition (in Firefox) when changing the period.
						// `periodIndex`, `dateFrom` and `dateTo` are not updated before
						// getTransactions() is called. Adding a 1ms delay fixes the issue.
						//
						// REF https://github.com/Canutin/desktop/issues/119#issuecomment-1293639150
						setTimeout(async () => {
							await getTransactions();
						}, 1);
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

			<Table>
				<thead>
					<tr>
						<TableTh hasCheckbox={true}>
							<label class="batchEditor-checkbox">
								<input
									class="batchEditor-checkbox__input"
									name="toggleSelectAll"
									type="checkbox"
									on:click={toggleSelectTransactions}
									checked={allSelected}
									disabled={transactions.length === 0}
									indeterminate={someSelected}
								/>
							</label>
						</TableTh>

						{#each TABLE_HEADERS as tableHeader}
							{@const { label, column } = tableHeader}
							<TableTh hasTotal={tableHeader.label === TABLE_HEADERS[4].label}>
								<button
									class="table__sortable
									{sortBy === column && 'table__sortable--active'}
									{sortBy === column && `table__sortable--${sortOrder}`}"
									on:click={async () => await sortTransactionsBy(column)}
								>
									{label}
								</button>
							</TableTh>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if filteredTransactions?.length > 0}
						{#each filteredTransactions as transaction}
							{@const { id, date, description, transactionCategory, account, value, isExcluded } =
								transaction}
							<TableTr isHighlighted={highlight === id || selectedTransactions.includes(id)}>
								<TableTd hasCheckbox={true}>
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
								</TableTd>
								<TableTd hasDate={true}>
									{formatInUTC(fromUnixTime(date), 'MMM dd, yyyy')}
								</TableTd>
								<TableTd>
									<Link href={`/transaction/${id}`}>{description}</Link>
								</TableTd>
								<TableTd>
									{transactionCategory.name}
								</TableTd>
								<TableTd>
									<Link href={`/account/${transaction.accountId}`}>{account.name}</Link>
								</TableTd>
								<TableTd hasTotal={true} isPositive={value > 0}>
									<span
										class={isExcluded ? `table__excluded` : null}
										title={isExcluded
											? "This transaction is excluded from 'The big picture' and 'Balance sheet' totals"
											: null}
									>
										{formatCurrency(value, 2, 2)}
									</span>
								</TableTd>
							</TableTr>
						{/each}
					{:else}
						<TableTr>
							<TableTd isNotice={true}>No transactions found</TableTd>
						</TableTr>
					{/if}
				</tbody>
			</Table>
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
