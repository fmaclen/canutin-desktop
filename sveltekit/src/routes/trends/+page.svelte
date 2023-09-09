<script lang="ts">
	import { writable } from 'svelte/store';
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import TableValue from '$lib/components/TableValue.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
	import TableButtonSortable from '$lib/components/TableButtonSortable.svelte';
	import TableValueTrend from '$lib/components/TableValueTrend.svelte';
	import {
		formatCurrency,
		formatPercentage,
		toCamelCase,
		sortAlphabetically,
		sortByNumber
	} from '$lib/helpers/misc';
	import { BalanceGroup, SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { ChartDataset } from 'chart.js';

	const title = 'Trends';

	export let data: PageData;

	function updateDatasets(originalDatasets: any, streamedDatasets: ChartDataset[]): ChartDataset[] {
		for (const streamedDataset of streamedDatasets) {
			const dataset = originalDatasets.find(
				(dataset: ChartDataset) => dataset.label === streamedDataset.label
			);
			if (dataset) {
				dataset.data = streamedDataset.data;
				dataset.backgroundColor = streamedDataset.backgroundColor;
				dataset.borderColor = streamedDataset.borderColor;
			}
		}
		return originalDatasets;
	}

	let cashDatasetsIsLoading = true;
	const cashDatasets = writable(data.trendCash.datasets);
	data.streamed.trendCashDataset.then((streamedDatasets) => {
		cashDatasets.update((data) => updateDatasets(data, streamedDatasets));
		cashDatasetsIsLoading = false;
	});

	let debtDatasetsIsLoading = true;
	const debtDatasets = writable(data.trendDebt.datasets);
	data.streamed.trendDebtDataset.then((streamedDatasets) => {
		debtDatasets.update((data) => updateDatasets(data, streamedDatasets));
		debtDatasetsIsLoading = false;
	});

	let investmentsDatasetsIsLoading = true;
	const investmentsDatasets = writable(data.trendInvestments.datasets);
	data.streamed.trendInvestmentsDataset.then((streamedDatasets) => {
		investmentsDatasets.update((data) => updateDatasets(data, streamedDatasets));
		investmentsDatasetsIsLoading = false;
	});

	let otherAssetsDatasetsIsLoading = true;
	const otherAssetsDatasets = writable(data.trendOtherAssets.datasets);
	data.streamed.trendOtherAssetsDataset.then((streamedDatasets) => {
		otherAssetsDatasets.update((data) => updateDatasets(data, streamedDatasets));
		otherAssetsDatasetsIsLoading = false;
	});

	let netWorthDatasetsIsLoading = true;
	const netWorthDatasets = writable(data.trendNetWorth.datasets);
	data.streamed.trendNetWorthDataset.then((streamedDatasets) => {
		netWorthDatasets.update((data) => updateDatasets(data, streamedDatasets));
		netWorthDatasetsIsLoading = false;
	});

	let trendNetWorthTableIsLoading = true;
	const netWorthTable = writable(data.trendNetWorthTable);
	data.streamed.trendNetWorthTableData.then((streamedData) => {
		netWorthTable.set(streamedData);
		trendNetWorthTableIsLoading = false;
		sortByColumn(toCamelCase(TableHeaders.ALLOCATION));
	});

	enum TableHeaders {
		BALANCE_TYPE = 'Balance type',
		ONE_WEEK = '1 week',
		ONE_MONTH = '1 month',
		SIX_MONTHS = '6 months',
		YEAR_TO_DATE = 'Year to date',
		ONE_YEAR = '1 year',
		FIVE_YEARS = '5 years',
		MAX = 'Max',
		ALLOCATION = 'Allocation'
	}

	// Default params
	let sortOrder = SortOrder.DESC;
	let sortBy: string;

	// Sorts the accounts by column and asc/desc order
	const sortByColumn = (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}

		$netWorthTable = $netWorthTable.sort((a, b) => {
			switch (column) {
				case toCamelCase(TableHeaders.BALANCE_TYPE):
					return sortAlphabetically(a.name, b.name, sortOrder);
				case toCamelCase(TableHeaders.ONE_WEEK):
					return sortByNumber(a.performanceOneWeek, b.performanceOneWeek, sortOrder);
				case toCamelCase(TableHeaders.ONE_MONTH):
					return sortByNumber(a.performanceOneMonth, b.performanceOneMonth, sortOrder);
				case toCamelCase(TableHeaders.SIX_MONTHS):
					return sortByNumber(a.performanceSixMonths, b.performanceSixMonths, sortOrder);
				case toCamelCase(TableHeaders.YEAR_TO_DATE):
					return sortByNumber(a.performanceYearToDate, b.performanceYearToDate, sortOrder);
				case toCamelCase(TableHeaders.ONE_YEAR):
					return sortByNumber(a.performanceOneYear, b.performanceOneYear, sortOrder);
				case toCamelCase(TableHeaders.FIVE_YEARS):
					return sortByNumber(a.performanceFiveYears, b.performanceFiveYears, sortOrder);
				case toCamelCase(TableHeaders.MAX):
					return sortByNumber(a.performanceMax, b.performanceMax, sortOrder);
				case toCamelCase(TableHeaders.ALLOCATION):
					return sortByNumber(a.allocation, b.allocation, sortOrder);
				default:
					return -1;
			}
		});
	};

	let tableHeaders = Object.values(TableHeaders).map((tableHeader) => {
		return {
			label: tableHeader,
			column: toCamelCase(tableHeader)
		};
	});
</script>

<Head {title} />

<ScrollView {title}>
	<Section title="Net worth">
		<div slot="CONTENT">
			<Plate>
				<ChartJs
					labels={data.trendNetWorth.labels}
					datasets={$netWorthDatasets}
					isLoading={netWorthDatasetsIsLoading}
				/>
				<Table>
					<thead>
						<tr>
							{#each tableHeaders as tableHeader}
								{@const { label, column } = tableHeader}
								<TableTh
									isAlignedRight={[
										TableHeaders.ONE_WEEK,
										TableHeaders.ONE_MONTH,
										TableHeaders.SIX_MONTHS,
										TableHeaders.YEAR_TO_DATE,
										TableHeaders.ONE_YEAR,
										TableHeaders.FIVE_YEARS,
										TableHeaders.MAX,
										TableHeaders.ALLOCATION
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
						{#each $netWorthTable as balanceType}
							{@const {
								name,
								performanceOneWeek,
								performanceOneMonth,
								performanceSixMonths,
								performanceYearToDate,
								performanceOneYear,
								performanceFiveYears,
								performanceMax,
								balanceOneWeek,
								balanceOneMonth,
								balanceSixMonths,
								balanceYearToDate,
								balanceOneYear,
								balanceFiveYears,
								balanceMax,
								currentBalance,
								allocation
							} = balanceType}
							{@const isDebt = balanceType.name === getBalanceGroupLabel(BalanceGroup.DEBT)}
							<TableTr>
								<TableTd>
									{name}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceOneWeek}
										performance={performanceOneWeek}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceOneMonth}
										performance={performanceOneMonth}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceSixMonths}
										performance={performanceSixMonths}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceYearToDate}
										performance={performanceYearToDate}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceOneYear}
										performance={performanceOneYear}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceFiveYears}
										performance={performanceFiveYears}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									<TableValueTrend
										value={balanceMax}
										performance={performanceMax}
										isReversed={isDebt}
									/>
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if currentBalance !== null}
										<TableValue
											title={formatCurrency(currentBalance, 2, 2)}
											isNumeric={true}
											isExcluded={name == 'Net worth'}
										>
											{allocation && formatPercentage(allocation, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
							</TableTr>
						{/each}
					</tbody>
				</Table>
			</Plate>
		</div>
	</Section>

	<Section title="Cash">
		<div slot="CONTENT">
			<Plate>
				<ChartJs
					labels={data.trendCash.labels}
					datasets={$cashDatasets}
					isLoading={cashDatasetsIsLoading}
				/>
			</Plate>
		</div>
	</Section>

	<Section title="Debt">
		<div slot="CONTENT">
			<Plate>
				<ChartJs
					labels={data.trendDebt.labels}
					datasets={$debtDatasets}
					isLoading={debtDatasetsIsLoading}
				/>
			</Plate>
		</div>
	</Section>

	<Section title="Investments">
		<div slot="CONTENT">
			<Plate>
				<ChartJs
					labels={data.trendInvestments.labels}
					datasets={$investmentsDatasets}
					isLoading={investmentsDatasetsIsLoading}
				/>
			</Plate>
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="CONTENT">
			<Plate>
				<ChartJs
					labels={data.trendOtherAssets.labels}
					datasets={$otherAssetsDatasets}
					isLoading={otherAssetsDatasetsIsLoading}
				/>
			</Plate>
		</div>
	</Section>
</ScrollView>
