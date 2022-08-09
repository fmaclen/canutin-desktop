<script lang="ts">
	import { format } from 'date-fns';
	import { page } from '$app/stores';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionTitle from '$lib/components/SectionTitle.svelte';
	import Button from '$lib/components/Button.svelte';
	import { SortOrder } from '$lib/helpers/constants';
	import { formatCurrency } from '$lib/helpers/misc';

	export let title = 'Transactions';

	// FIXME: see if we can set proper types on these variables
	export let transactions: any[];
	export let searchParams: any;

	const { pathname } = $page.url;

	const asc = SortOrder.ASC;
	const desc = SortOrder.DESC;

	const dateFrom = searchParams.dateFrom ? `dateFrom=${searchParams.dateFrom}` : null;
	const dateTo = searchParams.dateTo ? `dateTo=${searchParams.dateTo}` : null;

	const categoryId = searchParams.dateTo ? `categoryId=${searchParams.dateTo}` : null;
	const accountId = searchParams.dateFrom ? `accountId=${searchParams.dateFrom}` : null;
	const currentParams = [dateFrom, dateTo, categoryId, accountId].filter(Boolean);

	$: currentKeyword = searchParams.keyword;
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
		`sortOrder=${currentSortBy === 'description' && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;

	$: urlCategory = `${pathname}?${[
		...currentParams,
		'sortBy=categoryId',
		`sortOrder=${currentSortBy === 'categoryId' && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;

	$: urlAccount = `${pathname}?${[
		...currentParams,
		'sortBy=accountId',
		`sortOrder=${currentSortBy === 'accountId' && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;

	$: urlVaule = `${pathname}?${[
		...currentParams,
		'sortBy=value',
		`sortOrder=${currentSortBy === 'value' && currentSortOrder === desc ? asc : desc}`
	].join('&')}`;

	const submitForm = (event: any) => {};

	// Sum the total from all the transaction values
	export const sumTransactions = () => {
		return transactions.reduce((acc, transaction) => {
			return acc + transaction.value;
		}, 0);
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Find transaction">
		<div slot="CONTENT" class="importForm">
			<form class="form" on:submit={submitForm} method="GET">
				<fieldset class="form__fieldset">
					<div class="form__field">
						<label class="form__label" for="keyword">Keyword</label>
						<input
							class="form__input"
							type="text"
							placeholder="Search by description or amount"
							value={currentKeyword ? currentKeyword : ''}
							name="keyword"
						/>
					</div>
				</fieldset>
				<footer class="form__footer">
					<Button>Search</Button>
				</footer>
			</form>
		</div>
	</Section>

	<Section title="Transactions ({transactions.length}) ">
		<SectionTitle slot="HEADER" title={formatCurrency(sumTransactions(), 2)} />
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
							class="table__sortable {currentSortBy === 'categoryId' &&
								'table__sortable--active'} {currentSortBy === 'categoryId' &&
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
					{#if transactions.length > 0}
						{#each transactions as transaction}
							{@const { date, description, transactionCategory, account, value, isExcluded } =
								transaction}
							<tr class="table__tr">
								<td class="table__td table__td--date">{format(Date.parse(date), 'MMM dd, yyyy')}</td
								>
								<td class="table__td">{description}</td>
								<td class="table__td">{transactionCategory.name}</td>
								<td class="table__td">{account.name}</td>
								<td class="table__td table__td--total {value > 0 && `table__td--positive`}"
									><span
										class={isExcluded && `table__excluded`}
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
	table.table {
		position: relative;
		z-index: 1;
		width: 100%;
		table-layout: auto;
		border-collapse: collapse;
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
			padding-left: 16px;
		}

		&:last-child {
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

	input.form__input {
		background-color: var(--color-white);
		border: 2px solid var(--color-border);
		border-radius: 4px;
		padding: 6px;
		font-family: var(--font-sansSerif);
		font-size: 12px;
		box-sizing: border-box;
		min-height: 32px;

		&:active,
		&:focus {
			border-color: var(--color-bluePrimary);
		}
	}

	footer.form__footer {
		display: flex;
		justify-content: flex-end;
		padding: 8px 12px;
		background-color: var(--color-border);
	}
</style>
