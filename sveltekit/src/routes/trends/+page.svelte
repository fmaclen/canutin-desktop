<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import Table from '$lib/components/Table.svelte';
	import TableTh from '$lib/components/TableTh.svelte';
	import TableTr from '$lib/components/TableTr.svelte';
	import TableTd from '$lib/components/TableTd.svelte';
	import TableButtonSortable from '$lib/components/TableButtonSortable.svelte';
	import TableNoValue from '$lib/components/TableNoValue.svelte';
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
			<ChartJs
				labels={data.trendNetWorth.labels}
				datasets={$netWorthDatasets}
				isLoading={netWorthDatasetsIsLoading}
			/>
			<!-- {#await data.streamed.trendNetWorthTableData}
				loading...
			{:then value}
				{value[0].balanceLifetime}
			{/await} -->
			{#if trendNetWorthTableIsLoading}
				Loading...
			{/if}
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
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceOneWeek}
									<u title={formatCurrency(balanceType.balanceOneWeek, 2, 2)}>
										{balanceType.performanceOneWeek &&
											formatPercentage(balanceType.performanceOneWeek, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceOneMonth}
									<u title={formatCurrency(balanceType.balanceOneMonth, 2, 2)}>
										{balanceType.performanceOneMonth &&
											formatPercentage(balanceType.performanceOneMonth, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceSixMonths}
									<u title={formatCurrency(balanceType.balanceSixMonths, 2, 2)}>
										{balanceType.performanceSixMonths &&
											formatPercentage(balanceType.performanceSixMonths, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceYearToDate}
									<u title={formatCurrency(balanceType.balanceYearToDate, 2, 2)}>
										{balanceType.performanceYearToDate &&
											formatPercentage(balanceType.performanceYearToDate, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceOneYear}
									<u title={formatCurrency(balanceType.balanceOneYear, 2, 2)}>
										{balanceType.performanceOneYear &&
											formatPercentage(balanceType.performanceOneYear, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceFiveYears}
									<u title={formatCurrency(balanceType.balanceFiveYears, 2, 2)}>
										{balanceType.performanceFiveYears &&
											formatPercentage(balanceType.performanceFiveYears)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.balanceLifetime}
									<u title={formatCurrency(balanceType.balanceLifetime, 2, 2)}>
										{balanceType.performanceLifetime &&
											formatPercentage(balanceType.performanceLifetime, 2)}
									</u>
								{/if}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{#if balanceType.currentBalance}
									{formatCurrency(balanceType.currentBalance, 2, 2)}
									({balanceType.allocation && formatPercentage(balanceType.allocation, 2)})
								{/if}
							</TableTd>
						</TableTr>
					{/each}
				</tbody>
			</Table>
		</div>
	</Section>

	<Section title="Cash">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendCash.labels}
				datasets={$cashDatasets}
				isLoading={cashDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Debt">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendDebt.labels}
				datasets={$debtDatasets}
				isLoading={debtDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Investments">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendInvestments.labels}
				datasets={$investmentsDatasets}
				isLoading={investmentsDatasetsIsLoading}
			/>
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="CONTENT">
			<ChartJs
				labels={data.trendOtherAssets.labels}
				datasets={$otherAssetsDatasets}
				isLoading={otherAssetsDatasetsIsLoading}
			/>
		</div>
	</Section>
</ScrollView>
