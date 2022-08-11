<script lang="ts">
	import {
		subMonths,
		subYears,
		startOfMonth,
		endOfMonth,
		startOfYear,
		endOfYear,
		endOfDay,
		format,
		fromUnixTime
	} from 'date-fns';
	import { onMount } from 'svelte';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import Card from '$lib/components/Card.svelte';
	import { CardAppearance } from '$lib/components/Card';
	import { formatCurrency } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import type { EndpointTransaction } from './index.json';

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
			dateFrom: subMonths(today, 3),
			dateTo: endOfDay(today)
		},
		{
			label: 'Last 6 months',
			dateFrom: subMonths(today, 6),
			dateTo: endOfDay(today)
		},
		{
			label: 'Last 12 months',
			dateFrom: subMonths(today, 12),
			dateTo: endOfDay(today)
		},
		{
			label: 'Year to date',
			dateFrom: thisYearFrom,
			dateTo: endOfDay(today)
		},
		{
			label: 'Last year',
			dateFrom: subYears(thisYearFrom, 1),
			dateTo: subYears(thisYearTo, 1)
		},
		{
			label: 'Lifetime',
			dateFrom: subYears(today, 900),
			dateTo: endOfDay(today)
		}
	];

	enum Filter {
		ALL = 'all',
		CREDITS = 'credits',
		DEBITS = 'debits'
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

	// Default values
	$: transactions = [] as EndpointTransaction[];
	$: filteredTransactions = [] as EndpointTransaction[];
	$: periodIndex = 2; // Last 3 months
	$: dateFrom = format(periods[periodIndex].dateFrom, 'yyyy-MM-dd');
	$: dateTo = format(periods[periodIndex].dateTo, 'yyyy-MM-dd');
	$: filterBy = Filter.ALL;
	$: sortBy = TABLE_HEADERS[0].column; // Date
	$: sortOrder = SortOrder.DESC;
	$: keyword = '';

	const getTransactions = async () => {
		const params = [
			`dateFrom=${dateFrom}`,
			`dateTo=${dateTo}`,
			`sortBy=${sortBy}`,
			`sortOrder=${sortOrder}`,
			`filterBy=${filterBy}`,
			`keyword=${keyword}`
		];
		const response = await fetch(`/transactions.json?${params.join('&')}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		transactions = data.transactions;
		setFilterBy(filterBy);
	};

	// When the component is mounted retrieve transactions with default values
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
	const sumTransactions = (transactions: EndpointTransaction[]) => {
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
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
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
					on:keyup={() => getTransactions()}
				/>
				<FormSelect
					options={periods}
					bind:value={periodIndex}
					on:change={() => getTransactions()}
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
						value={formatCurrency(sumTransactions(filteredTransactions), 2)}
					/>
				</div>
			</header>

			<table class="table">
				<thead>
					{#each TABLE_HEADERS as tableHeader}
						{@const { label, column } = tableHeader}
						<th
							class="table__th {tableHeader.label === TABLE_HEADERS[4].label && 'table__th--total'}"
						>
							<button
								class="table__sortable
								{sortBy === column && 'table__sortable--active'}
								{sortBy === column && `table__sortable--${sortOrder}`}"
								on:click={() => sortTransactionsBy(column)}>{label}</button
							>
						</th>
					{/each}
				</thead>
				<tbody>
					{#if filteredTransactions?.length > 0}
						{#each filteredTransactions as transaction}
							{@const { date, description, transactionCategory, account, value, isExcluded } =
								transaction}
							<tr class="table__tr">
								<td class="table__td table__td--date"
									>{format(fromUnixTime(date), 'MMM dd, yyyy')}</td
								>
								<td class="table__td">{description}</td>
								<td class="table__td">{transactionCategory.name}</td>
								<td class="table__td">{account.name}</td>
								<td class="table__td table__td--total {value > 0 && `table__td--positive`}"
									><span
										class={isExcluded ? `table__excluded` : null}
										title="This transaction is excluded from 'The big picture' and 'Balance sheet' totals"
									>
										{formatCurrency(value, 2)}
									</span></td
								>
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
		box-shadow: var(--box-shadow);
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
		background-color: var(--color-white);
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
		border-bottom: 1px solid var(--color-grey5);
		vertical-align: top;

		&:nth-child(odd) {
			td.table__td {
				background-color: var(--color-grey3);
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

		&--date {
			font-family: var(--font-monospace);
			text-transform: uppercase;
			font-size: 11px;
		}

		&--total {
			font-family: var(--font-monospace);
			text-align: right;
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
</style>
