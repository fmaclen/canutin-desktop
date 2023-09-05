<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Link from '$lib/components/Link.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import TableButtonSortable from '$lib/components/TableButtonSortable.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
	import { toCamelCase } from '$lib/helpers/misc';
	import { formatCurrency, formatInUTC } from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import Plate from '../../lib/components/Plate.svelte';

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
	const sortAccountsBy = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}

		accounts = accounts.sort((a, b) => {
			switch (column) {
				case toCamelCase(TableHeaders.NAME):
					return sortOrder === SortOrder.DESC
						? a.name.localeCompare(b.name)
						: b.name.localeCompare(a.name);

				case toCamelCase(TableHeaders.INSTITUTION): {
					// Need to convert `null` institutions to string so they can be compared
					if (a.institution === null) a.institution = '';
					if (b.institution === null) b.institution = '';
					return sortOrder === SortOrder.DESC
						? a.institution.localeCompare(b.institution)
						: b.institution.localeCompare(a.institution);
				}

				case toCamelCase(TableHeaders.ACCOUNT_TYPE):
					return sortOrder === SortOrder.DESC
						? a.accountType.name.localeCompare(b.accountType.name)
						: b.accountType.name.localeCompare(a.accountType.name);

				case toCamelCase(TableHeaders.TRANSACTIONS):
					return sortOrder === SortOrder.ASC
						? a.transactionCount - b.transactionCount
						: b.transactionCount - a.transactionCount;

				case toCamelCase(TableHeaders.MARKED_AS):
					return sortOrder === SortOrder.ASC
						? Number(a.isClosed) - Number(b.isClosed)
						: Number(b.isClosed) - Number(a.isClosed);

				case toCamelCase(TableHeaders.BALANCE_TYPE):
					return sortOrder === SortOrder.ASC
						? Number(a.isAutoCalculated) - Number(b.isAutoCalculated)
						: Number(b.isAutoCalculated) - Number(a.isAutoCalculated);

				case toCamelCase(TableHeaders.BALANCE):
					return sortOrder === SortOrder.ASC ? a.balance - b.balance : b.balance - a.balance;

				case toCamelCase(TableHeaders.LAST_UPDATED):
					return sortOrder === SortOrder.ASC
						? a.lastUpdated - b.lastUpdated
						: b.lastUpdated - a.lastUpdated;

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
		sortAccountsBy(toCamelCase(TableHeaders.NAME));
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
										on:click={async () => await sortAccountsBy(column)}
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
											<Link href={`/transactions?keyword=accountId:${id}&periodPreset=Lifetime`}>
												{transactionCount}
											</Link>
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

									<TableTd hasTotal={true} isPositive={balance > 0} isAlignedRight={true}>
										{formatCurrency(balance, 2, 2)}
									</TableTd>

									<TableTd hasDate={true} isAlignedRight={true}>
										{formatInUTC(fromUnixTime(lastUpdated), 'MMM dd, yyyy')}
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
