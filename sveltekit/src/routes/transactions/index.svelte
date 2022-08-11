<script lang="ts">
	import { format } from 'date-fns';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Card from '$lib/components/Card.svelte';
	import { CardAppearance } from '$lib/components/Card';
	import { formatCurrency } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';

	export let title = 'Transactions';

	$: transactions = [];
	$: keyword = '';
	$: sortBy = 'date';
	$: sortOrder = 'desc';
	$: dateTo = '2022-08-31';
	$: dateFrom = '2022-01-01';

	const getTransactions = async () => {
		const response = await fetch(
			`/transactions.json?keyword=${keyword}&sortBy=${sortBy}&sortOrder=${sortOrder}&dateFrom=${dateFrom}&dateTo=${dateTo}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
		const data = await response.json();
		transactions = data.transactions;
	};

	onMount(async () => {
		await getTransactions();
	});

	export const sortTransactionsBy = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}
		await getTransactions();
	};

	// Sum the total from all the transaction values
	export const sumTransactions = (transactions: any[]) => {
		// FIXME: see if we can set proper types on `transaction`
		return transactions.reduce((acc, transaction) => {
			return !transaction.isExcluded ? acc + transaction.value : 0;
		}, 0);
	};

	console.log(sortBy);
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Browse transactions">
		<nav class="segmentedControl" slot="HEADER">
			<button class="segmentedControl__button segmentedControl__button--active" type="button"
				>All</button
			>
			<button class="segmentedControl__button" type="button">Credits</button>
			<button class="segmentedControl__button" type="button">Debits</button>
		</nav>
		<div slot="CONTENT" class="transactions">
			<header class="transactions__header">
				<form class="transactions__form" on:submit|preventDefault={getTransactions}>
					<fieldset class="transactions__fieldset">
						<input
							class="form__input"
							type="text"
							placeholder="Type to filter by description, amount, category or account"
							name="keyword"
							bind:value={keyword}
						/>
						<select class="form__input">
							<option>Last 3 months</option>
						</select>
					</fieldset>
				</form>
				<div class="transactions__summary">
					<Card
						appearance={CardAppearance.SECONDARY}
						title="Transactions"
						value={transactions?.length}
					/>
					<Card
						appearance={CardAppearance.SECONDARY}
						title="Net balance"
						value={formatCurrency(sumTransactions(transactions), 2)}
					/>
				</div>
			</header>

			<table class="table">
				<thead>
					<th class="table__th">
						<button
							class="table__sortable {sortBy === 'date' && 'table__sortable--active'} {sortBy ===
								'date' && `table__sortable--${sortOrder}`}"
							on:click={() => sortTransactionsBy('date')}>Date</button
						>
					</th>
					<th class="table__th"
						><button
							class="table__sortable {sortBy === 'description' &&
								'table__sortable--active'} {sortBy === 'description' &&
								`table__sortable--${sortOrder}`}"
							on:click={() => sortTransactionsBy('description')}
							type="button">Description</button
						></th
					>
					<th class="table__th"
						><button
							class="table__sortable {sortBy === 'categoryId' &&
								'table__sortable--active'} {sortBy === 'categoryId' &&
								`table__sortable--${sortOrder}`}"
							on:click={() => sortTransactionsBy('categoryId')}>Category</button
						></th
					>
					<th class="table__th"
						><button
							class="table__sortable {sortBy === 'accountId' &&
								'table__sortable--active'} {sortBy === 'accountId' &&
								`table__sortable--${sortOrder}`}"
							on:click={() => sortTransactionsBy('accountId')}>Account</button
						></th
					>
					<th class="table__th table__th--total"
						><button
							class="table__sortable {sortBy === 'value' && 'table__sortable--active'} {sortBy ===
								'value' && `table__sortable--${sortOrder}`}"
							on:click={() => sortTransactionsBy('value')}>Amount</button
						></th
					>
				</thead>
				<tbody>
					{#if transactions?.length > 0}
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
	div.transactions {
		box-shadow: var(--box-shadow);
	}

	header.transactions__header {
		display: flex;
		flex-direction: column;
		row-gap: 8px;
		border-radius: 4px 4px 0 0;
		background-color: var(--color-grey3);
		border-bottom: 1px solid var(--color-border);
		padding: 16px;
	}

	div.transactions__summary {
		display: grid;
		grid-auto-flow: column;
		column-gap: 8px;
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

	fieldset.transactions__fieldset {
		display: grid;
		column-gap: 8px;
		grid-template-columns: 4fr 1fr;
		border: none;
		padding: 0;
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
