<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Link from '$lib/components/Link.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import TableButtonSortable from '$lib/components/TableButtonSortable.svelte';
	import TableValue from '$lib/components/TableValue.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
	import { toCamelCase } from '$lib/helpers/misc';
	import { formatCurrency, formatInUTC } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import { sortBooleans, sortAlphabetically, sortNumerically } from '$lib/helpers/tables';
	import type { PageData } from './$types';

	const title = 'Accounts';

	export let data: PageData;
	let { accounts } = data;

	enum TableHeaders {
		NAME = 'Name',
		INSTITUTION = 'Institution',
		ACCOUNT_TYPE = 'Account type',
		TRANSACTIONS = 'Transactions',
		MARKED_AS = 'Marked as',
		BALANCE_TYPE = 'Balance type',
		BALANCE = 'Balance',
		LAST_UPDATED = 'Last updated'
	}

	// Default params
	let sortOrder = SortOrder.DESC;
	let sortBy: string;

	// Sorts the accounts by column and asc/desc order
	const sortByColumn = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}

		accounts = accounts.sort((a, b) => {
			switch (column) {
				case toCamelCase(TableHeaders.NAME):
					return sortAlphabetically(a.name, b.name, sortOrder);
				case toCamelCase(TableHeaders.INSTITUTION):
					return sortAlphabetically(a.institution, b.institution, sortOrder);
				case toCamelCase(TableHeaders.ACCOUNT_TYPE):
					return sortAlphabetically(a.accountType.name, b.accountType.name, sortOrder);
				case toCamelCase(TableHeaders.TRANSACTIONS):
					return sortNumerically(a.transactionCount, b.transactionCount, sortOrder);
				case toCamelCase(TableHeaders.MARKED_AS):
					return sortBooleans(a.isClosed, b.isClosed, sortOrder);
				case toCamelCase(TableHeaders.BALANCE_TYPE):
					return sortBooleans(a.isAutoCalculated, b.isAutoCalculated, sortOrder);
				case toCamelCase(TableHeaders.BALANCE):
					return sortNumerically(a.balance, b.balance, sortOrder);
				case toCamelCase(TableHeaders.LAST_UPDATED):
					return sortNumerically(a.lastUpdated, b.lastUpdated, sortOrder);
				default:
					return -1;
			}
		});
	};

	$: accountsClosed = accounts.filter((account) => account.isClosed).length;
	$: accountsAutoCalculated = accounts.filter((account) => account.isAutoCalculated).length;

	$: tableHeaders = Object.values(TableHeaders)
		.filter((tableHeader) => {
			if (tableHeader === TableHeaders.MARKED_AS && accountsClosed === 0) return false;
			if (tableHeader === TableHeaders.BALANCE_TYPE && accountsAutoCalculated === 0) return false;
			return true;
		})
		.map((tableHeader) => {
			return {
				label: tableHeader,
				column: toCamelCase(tableHeader)
			};
		});

	onMount(async () => {
		sortByColumn(toCamelCase(TableHeaders.NAME));
	});
</script>

<Head {title} />

<ScrollView {title}>
	<nav slot="NAV">
		<Link href="/account/add">Add account</Link>
		<Link href="/import">Import</Link>
	</nav>
	<Section title="All accounts / {accounts.length}">
		<div slot="CONTENT">
			<Plate>
				<Table>
					<thead>
						<tr>
							{#each tableHeaders as tableHeader}
								{@const { label, column } = tableHeader}
								<TableTh
									isAlignedRight={[TableHeaders.BALANCE, TableHeaders.LAST_UPDATED].includes(
										tableHeader.label
									)}
								>
									<TableButtonSortable
										{label}
										{sortOrder}
										sortBy={sortBy === column}
										on:click={() => sortByColumn(column)}
									/>
								</TableTh>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#if accounts?.length > 0}
							{#each accounts as account}
								{@const {
									id,
									lastUpdated,
									balance,
									name,
									institution,
									accountType,
									isAutoCalculated,
									isClosed,
									transactionCount
								} = account}
								<TableTr>
									<TableTd>
										<Link href={`/account/${id}`}>{name}</Link>
									</TableTd>

									<TableTd>
										{#if institution}
											{institution}
										{:else}
											<TableNoValue />
										{/if}
									</TableTd>

									<TableTd>
										{accountType.name}
									</TableTd>

									<TableTd>
										{#if transactionCount > 0}
											<TableValue isNumeric={true}>
												<Link href={`/transactions?keyword=accountId:${id}&periodPreset=Lifetime`}>
													{transactionCount}
												</Link>
											</TableValue>
										{:else}
											<TableNoValue />
										{/if}
									</TableTd>

									{#if accountsClosed > 0}
										<TableTd>
											{#if isClosed}
												Closed
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>
									{/if}

									{#if accountsAutoCalculated > 0}
										<TableTd>
											{#if isAutoCalculated}
												Auto-calculated
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>
									{/if}

									<TableTd isAlignedRight={true}>
										<TableValue isNumeric={true} isPositive={balance > 0}>
											{formatCurrency(balance, 2, 2)}
										</TableValue>
									</TableTd>

									<TableTd isAlignedRight={true}>
										<TableValue isDate={true}>
											{formatInUTC(fromUnixTime(lastUpdated), 'MMM dd, yyyy')}
										</TableValue>
									</TableTd>
								</TableTr>
							{/each}
						{:else}
							<TableTr>
								<TableTd isNotice={true}>No accounts found</TableTd>
							</TableTr>
						{/if}
					</tbody>
				</Table>
			</Plate>
		</div>
	</Section>
</ScrollView>
