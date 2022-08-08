<script lang="ts">
	import { format } from 'date-fns';
	import { page } from '$app/stores';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import { SortOrder } from '$lib/helpers/constants';

	export let title = 'Transactions';
	export let transactions: any[];
	export let searchParams: any;

	const { pathname } = $page.url;

	const asc = SortOrder.ASC;
	const desc = SortOrder.DESC;

	const dateFrom = searchParams.dateFrom ? `dateFrom=${searchParams.dateFrom}` : null;
	const dateTo = searchParams.dateTo ? `dateTo=${searchParams.dateTo}` : null;

	const transactionCategoryId = searchParams.dateTo
		? `transactionCategoryId=${searchParams.dateTo}`
		: null;
	const accountId = searchParams.dateFrom ? `accountId=${searchParams.dateFrom}` : null;
	const currentParams = [dateFrom, dateTo, transactionCategoryId, accountId].filter(Boolean);

	$: currentSortBy = searchParams.sortBy;
	$: currentSortOrder = searchParams.sortOrder;

	$: urlDate = `${pathname}?${[
		...currentParams,
		'sortBy=date',
		`sortOrder=${['date', null].includes(currentSortBy) && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;

	$: urlDescription = `${pathname}?${[
		...currentParams,
		'sortBy=description',
		`sortOrder=${
			['description', null].includes(currentSortBy) && currentSortOrder === desc ? asc : desc
		}`
	].join('&')}`;

	$: urlCategory = `${pathname}?${[
		...currentParams,
		'sortBy=categoryId',
		`sortOrder=${
			['categoryId', null].includes(currentSortBy) && currentSortOrder === desc ? asc : desc
		}`
	].join('&')}`;

	$: urlAccount = `${pathname}?${[
		...currentParams,
		'sortBy=accountId',
		`sortOrder=${
			['accountId', null].includes(currentSortBy) && currentSortOrder === desc ? asc : desc
		}`
	].join('&')}`;

	$: urlVaule = `${pathname}?${[
		...currentParams,
		'sortBy=value',
		`sortOrder=${['value', null].includes(currentSortBy) && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Transactions">
		<div slot="CONTENT">
			<table class="table">
				<thead>
					<th class="table__th">
						<a
							class="table__sortable {currentSortBy === 'date' &&
								'table__sortable--active'} {currentSortBy === 'date' &&
								`table__sortable--${currentSortOrder}`}"
							href={`${urlDate}`}>Date</a
						>
					</th>
					<th class="table__th"
						><a
							class="table__sortable {currentSortBy === 'description' &&
								'table__sortable--active'} {currentSortBy === 'description' &&
								`table__sortable--${currentSortOrder}`}"
							href={`${urlDescription}`}>Description</a
						></th
					>
					<th class="table__th"
						><a
							class="table__sortable {currentSortBy === 'transactionCategoryId' &&
								'table__sortable--active'} {currentSortBy === 'transactionCategoryId' &&
								`table__sortable--${currentSortOrder}`}"
							href={`${urlCategory}`}>Category</a
						></th
					>
					<th class="table__th"
						><a
							class="table__sortable {currentSortBy === 'accountId' &&
								'table__sortable--active'} {currentSortBy === 'accountId' &&
								`table__sortable--${currentSortOrder}`}"
							href={`${urlAccount}`}>Account</a
						></th
					>
					<th class="table__th table__th--total"
						><a
							class="table__sortable {currentSortBy === 'value' &&
								'table__sortable--active'} {currentSortBy === 'value' &&
								`table__sortable--${currentSortOrder}`}"
							href={`${urlVaule}`}>Amount</a
						></th
					>
				</thead>
				<tbody>
					{#each transactions as transaction}
						{@const { date, description, transactionCategory, account, value } = transaction}
						<tr class="table__tr">
							<td class="table__td table__td--date">{format(Date.parse(date), 'MMM dd, yyyy')}</td>
							<td class="table__td">{description}</td>
							<td class="table__td">{transactionCategory.name}</td>
							<td class="table__td">{account.name}</td>
							<td class="table__td table__td--total">{value}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	table.table {
		position: relative;
		z-index: 1;
		width: 100%;
		table-layout: auto;
		border-collapse: collapse;
		border-radius: 4px;
		background-color: var(--color-white);
		box-shadow: var(--box-shadow);
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
			border-top-left-radius: 4px;
			padding-left: 16px;
		}

		&:last-child {
			border-top-right-radius: 4px;
			padding-right: 16px;
		}

		&--total {
			text-align: right;
		}
	}

	a.table__sortable {
		color: var(--color-grey40);
		text-decoration: none;

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

		&:nth-child(even) {
			td.table__td:first-child {
				background-color: var(--color-grey3);
			}
		}

		&:first-child td.table__td:first-child {
			border-top-left-radius: 4px;
		}
		&:first-child td.table__td:last-child {
			border-top-right-radius: 4px;
		}
		&:last-child td.table__td:first-child {
			border-bottom-left-radius: 4px;
		}
		&:last-child td.table__td:last-child {
			border-bottom-right-radius: 4px;
		}
	}

	td.table__td {
		font-size: 12px;
		padding: 12px 16px 12px 0;
		color: var(--color-grey90);

		&--date {
			font-family: var(--font-monospace);
			text-transform: uppercase;
			font-size: 11px;
		}

		&--total {
			font-family: var(--font-monospace);
			text-align: right;
		}

		&:first-child {
			padding-left: 16px;
		}
	}
</style>
