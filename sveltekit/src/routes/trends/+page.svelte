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
	import { SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';

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
		LIFETIME = 'Lifetime',
		ALLOCATION = 'Allocation'
	}
	// Default params
	let sortOrder = SortOrder.DESC;
	let sortBy: string;
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
										TableHeaders.LIFETIME,
										TableHeaders.ALLOCATION
									].includes(tableHeader.label)}
								>
									<TableButtonSortable {label} {sortOrder} sortBy={sortBy === column} />
								</TableTh>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each $netWorthTable as balanceType}
							<TableTr>
								<TableTd>
									{typeof balanceType.name === 'string'
										? balanceType.name
										: getBalanceGroupLabel(balanceType.name)}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceOneWeek && balanceType.performanceOneWeek}
										<TableValue
											title={formatCurrency(balanceType.balanceOneWeek, 2, 2)}
											isPositive={balanceType.performanceOneWeek > 0}
											isNegative={balanceType.performanceOneWeek < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceOneWeek, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceOneMonth && balanceType.performanceOneMonth}
										<TableValue
											title={formatCurrency(balanceType.balanceOneMonth, 2, 2)}
											isPositive={balanceType.performanceOneMonth > 0}
											isNegative={balanceType.performanceOneMonth < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceOneMonth, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceSixMonths && balanceType.performanceSixMonths}
										<TableValue
											title={formatCurrency(balanceType.balanceSixMonths, 2, 2)}
											isPositive={balanceType.performanceSixMonths > 0}
											isNegative={balanceType.performanceSixMonths < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceSixMonths, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceYearToDate && balanceType.performanceYearToDate}
										<TableValue
											title={formatCurrency(balanceType.balanceYearToDate, 2, 2)}
											isPositive={balanceType.performanceYearToDate > 0}
											isNegative={balanceType.performanceYearToDate < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceYearToDate, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceOneYear && balanceType.performanceOneYear}
										<TableValue
											title={formatCurrency(balanceType.balanceOneYear, 2, 2)}
											isPositive={balanceType.performanceOneYear > 0}
											isNegative={balanceType.performanceOneYear < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceOneYear, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceFiveYears && balanceType.performanceFiveYears}
										<TableValue
											title={formatCurrency(balanceType.balanceFiveYears, 2, 2)}
											isPositive={balanceType.performanceFiveYears > 0}
											isNegative={balanceType.performanceFiveYears < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceFiveYears)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.balanceLifetime && balanceType.performanceLifetime}
										<TableValue
											title={formatCurrency(balanceType.balanceLifetime, 2, 2)}
											isPositive={balanceType.performanceLifetime > 0}
											isNegative={balanceType.performanceLifetime < 0}
											isNumeric={true}
											isTrend={true}
										>
											{formatPercentage(balanceType.performanceLifetime, 2)}
										</TableValue>
									{:else}
										<TableNoValue />
									{/if}
								</TableTd>
								<TableTd isAlignedRight={true} isLoading={trendNetWorthTableIsLoading}>
									{#if balanceType.currentBalance}
										<TableValue
											title={formatCurrency(balanceType.currentBalance, 2, 2)}
											isNumeric={true}
											isExcluded={balanceType.name == 'Net worth'}
										>
											{balanceType.allocation && formatPercentage(balanceType.allocation, 2)}
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
