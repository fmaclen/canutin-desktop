<script lang="ts">
	import { fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Link from '$lib/components/Link.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import TableButtonSortable from '$lib/components/TableButtonSortable.svelte';
	import TableValue from '$lib/components/TableValue.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
	import { toCamelCase } from '$lib/helpers/misc';
	import {
		formatCurrency,
		formatInUTC,
		sortByBoolean,
		sortByString,
		sortByNumber
	} from '$lib/helpers/misc';
	import { SortOrder } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	const title = 'Assets';

	export let data: PageData;
	let { assets } = data;

	enum TableHeaders {
		NAME = 'Name',
		ASSET_TYPE = 'Asset type',
		MARKED_AS = 'Marked as',
		SYMBOL = 'Symbol',
		QUANTITY = 'Quantity',
		COST = 'Cost',
		VALUE = 'Value',
		LAST_UPDATED = 'Last updated'
	}

	// Default params
	let sortOrder = SortOrder.DESC;
	let sortBy: string;

	// Sorts the assets by column and asc/desc order
	const sortByColumn = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}

		assets = assets.sort((a, b) => {
			switch (column) {
				case toCamelCase(TableHeaders.NAME):
					return sortByString(a.name, b.name, sortOrder);
				case toCamelCase(TableHeaders.ASSET_TYPE):
					return sortByString(a.assetType.name, b.assetType.name, sortOrder);
				case toCamelCase(TableHeaders.SYMBOL):
					return sortByString(a.symbol, b.symbol, sortOrder);
				case toCamelCase(TableHeaders.MARKED_AS):
					return sortByBoolean(a.isSold, b.isSold, sortOrder);
				case toCamelCase(TableHeaders.QUANTITY):
					return sortByNumber(a.quantity, b.quantity, sortOrder);
				case toCamelCase(TableHeaders.COST):
					return sortByNumber(a.cost, b.cost, sortOrder);
				case toCamelCase(TableHeaders.VALUE):
					return sortByNumber(a.value, b.value, sortOrder);
				case toCamelCase(TableHeaders.LAST_UPDATED):
					return sortByNumber(a.lastUpdated, b.lastUpdated, sortOrder);
				default:
					return -1;
			}
		});
	};

	$: assetsSold = assets.filter((asset) => asset.isSold).length;
	$: assetsQuantifiable = assets.filter((asset) => asset.quantity).length;

	$: tableHeaders = Object.values(TableHeaders)
		.filter((tableHeader) => {
			if (tableHeader === TableHeaders.MARKED_AS && assetsSold === 0) return false;
			if (
				[TableHeaders.QUANTITY, TableHeaders.COST, TableHeaders.SYMBOL].includes(tableHeader) &&
				assetsQuantifiable === 0
			)
				return false;
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
		<Link href="/asset/add">Add asset</Link>
		<Link href="/import">Import</Link>
	</nav>
	<Section title="All assets / {assets.length}">
		<div slot="CONTENT">
			<Plate>
				<Table>
					<thead>
						<tr>
							{#each tableHeaders as tableHeader}
								{@const { label, column } = tableHeader}
								<TableTh
									isAlignedRight={[
										TableHeaders.QUANTITY,
										TableHeaders.COST,
										TableHeaders.VALUE,
										TableHeaders.LAST_UPDATED
									].includes(tableHeader.label)}
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
						{#if assets?.length > 0}
							{#each assets as asset}
								{@const {
									id,
									assetType,
									symbol,
									isSold,
									name,
									cost,
									quantity,
									value,
									lastUpdated
								} = asset}
								<TableTr>
									<TableTd>
										<Link href={`/asset/${id}`}>{name}</Link>
									</TableTd>

									<TableTd>
										{assetType.name}
									</TableTd>

									{#if assetsSold > 0}
										<TableTd>
											{#if isSold}
												Sold
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>
									{/if}

									{#if assetsQuantifiable > 0}
										<TableTd>
											{#if symbol}
												{symbol}
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>

										<TableTd isAlignedRight={true}>
											{#if quantity}
												<TableValue isNumeric={true}>
													{quantity}
												</TableValue>
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>

										<TableTd isAlignedRight={true}>
											{#if cost}
												<TableValue isNumeric={true}>
													{formatCurrency(cost, 2, 2)}
												</TableValue>
											{:else}
												<TableNoValue />
											{/if}
										</TableTd>
									{/if}

									<TableTd isAlignedRight={true}>
										<TableValue isNumeric={true} isPositive={value > 0}>
											{formatCurrency(value, 2, 2)}
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
								<TableTd isNotice={true}>No assets found</TableTd>
							</TableTr>
						{/if}
					</tbody>
				</Table>
			</Plate>
		</div>
	</Section>
</ScrollView>
