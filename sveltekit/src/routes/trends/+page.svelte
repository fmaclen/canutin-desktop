<script lang="ts">
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
	import type { PageData } from './$types';
	import { writable } from 'svelte/store';
	import type { ChartDataset } from 'chart.js';
	import { formatCurrency, formatPercentage, toCamelCase } from '$lib/helpers/misc';
	import { BalanceGroup, SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';
	import TableValueTrend from '../../lib/components/TableValueTrend.svelte';

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
	});

	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////

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
	const sortAccountsBy = async (column: string) => {
		if (sortBy === column) {
			sortOrder = sortOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC;
		} else {
			sortBy = column;
		}

		$netWorthTable = $netWorthTable.sort((a, b) => {
			switch (column) {
				case toCamelCase(TableHeaders.BALANCE_TYPE):
					console.log('a', a.name);
					console.log('b', b.name);
					return sortOrder === SortOrder.DESC
						? a.name.localeCompare(b.name)
						: b.name.localeCompare(a.name);

				// Need to convert `null` performances to `0` so they can be compared

				case toCamelCase(TableHeaders.ONE_WEEK):
					if (a.performanceOneWeek === null) a.performanceOneWeek = 0;
					if (b.performanceOneWeek === null) b.performanceOneWeek = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceOneWeek - b.performanceOneWeek
						: b.performanceOneWeek - a.performanceOneWeek;

				case toCamelCase(TableHeaders.ONE_MONTH):
					if (a.performanceOneMonth === null) a.performanceOneMonth = 0;
					if (b.performanceOneMonth === null) b.performanceOneMonth = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceOneMonth - b.performanceOneMonth
						: b.performanceOneMonth - a.performanceOneMonth;

				case toCamelCase(TableHeaders.SIX_MONTHS):
					if (a.performanceSixMonths === null) a.performanceSixMonths = 0;
					if (b.performanceSixMonths === null) b.performanceSixMonths = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceSixMonths - b.performanceSixMonths
						: b.performanceSixMonths - a.performanceSixMonths;

				case toCamelCase(TableHeaders.YEAR_TO_DATE):
					if (a.performanceYearToDate === null) a.performanceYearToDate = 0;
					if (b.performanceYearToDate === null) b.performanceYearToDate = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceYearToDate - b.performanceYearToDate
						: b.performanceYearToDate - a.performanceYearToDate;

				case toCamelCase(TableHeaders.ONE_YEAR):
					if (a.performanceOneYear === null) a.performanceOneYear = 0;
					if (b.performanceOneYear === null) b.performanceOneYear = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceOneYear - b.performanceOneYear
						: b.performanceOneYear - a.performanceOneYear;

				case toCamelCase(TableHeaders.FIVE_YEARS):
					if (a.performanceFiveYears === null) a.performanceFiveYears = 0;
					if (b.performanceFiveYears === null) b.performanceFiveYears = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceFiveYears - b.performanceFiveYears
						: b.performanceFiveYears - a.performanceFiveYears;

				case toCamelCase(TableHeaders.MAX):
					if (a.performanceMax === null) a.performanceMax = 0;
					if (b.performanceMax === null) b.performanceMax = 0;
					return sortOrder === SortOrder.ASC
						? a.performanceMax - b.performanceMax
						: b.performanceMax - a.performanceMax;

				case toCamelCase(TableHeaders.ALLOCATION):
					if (a.allocation === null) a.allocation = 0;
					if (b.allocation === null) b.allocation = 0;
					return sortOrder === SortOrder.ASC
						? a.allocation - b.allocation
						: b.allocation - a.allocation;

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
										on:click={async () => await sortAccountsBy(column)}
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
							{@const isDebt = balanceType.name === BalanceGroup.DEBT}
							<TableTr>
								<TableTd>
									{typeof name === 'string' ? name : getBalanceGroupLabel(name)}
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
