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
	import { formatCurrency, toCamelCase } from '$lib/helpers/misc';
	import { SortOrder, getBalanceGroupLabel } from '$lib/helpers/constants';
	import { writable } from 'svelte/store';
	import type { ChartDataset } from 'chart.js';

	const title = 'Trends';

	export let data: PageData;

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

	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////

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

	const cashDatasets = writable<ChartDataset[]>(data.trendCash.datasets);
	data.streaming.trendCashDataset.then((streamedDatasets: ChartDataset[]) =>
		cashDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets))
	);

	const debtDatasets = writable<ChartDataset[]>(data.trendDebt.datasets);
	data.streaming.trendDebtDataset.then((streamedDatasets: ChartDataset[]) =>
		debtDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets))
	);

	const investmentsDatasets = writable<ChartDataset[]>(data.trendInvestments.datasets);
	data.streaming.trendInvestmentsDataset.then((streamedDatasets: ChartDataset[]) =>
		investmentsDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets))
	);

	const otherAssetsDatasets = writable<ChartDataset[]>(data.trendOtherAssets.datasets);
	data.streaming.trendOtherAssetsDataset.then((streamedDatasets: ChartDataset[]) =>
		otherAssetsDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets))
	);

	const netWorthDatasets = writable<ChartDataset[]>(data.trendNetWorth.datasets);
	data.streaming.trendNetWorthDataset.then((streamedDatasets: ChartDataset[]) =>
		netWorthDatasets.update((data: ChartDataset[]) => updateDatasets(data, streamedDatasets))
	);
</script>

<Head {title} />

<ScrollView {title}>
	<Section title="Net worth">
		<div slot="CONTENT">
			<ChartJs labels={data.trendNetWorth.labels} datasets={$netWorthDatasets} />
			<!-- <Table>
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
					{#each data.tableNetWorth as balanceType}
						<TableTr>
							<TableTd>
								{typeof balanceType.name === 'string'
									? balanceType.name
									: getBalanceGroupLabel(balanceType.name)}
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceOneWeek, 2, 2)}>
									{balanceType.performanceOneWeek}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceOneMonth, 2, 2)}>
									{balanceType.performanceOneMonth}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceSixMonths, 2, 2)}>
									{balanceType.performanceSixMonths}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceYearToDate, 2, 2)}>
									{balanceType.performanceYearToDate}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceOneYear, 2, 2)}>
									{balanceType.performanceOneYear}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceFiveYears, 2, 2)}>
									{balanceType.performanceFiveYears}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								<u title={formatCurrency(balanceType.balanceLifetime, 2, 2)}>
									{balanceType.performanceLifetime}%
								</u>
							</TableTd>
							<TableTd hasTotal={true} isAlignedRight={true}>
								{formatCurrency(balanceType.currentBalance, 2, 2)}
								({balanceType.allocation}%)
							</TableTd>
						</TableTr>
					{/each}
				</tbody>
			</Table> -->
		</div>
	</Section>

	<Section title="Cash">
		<div slot="CONTENT">
			<ChartJs labels={data.trendCash.labels} datasets={$cashDatasets} />
		</div>
	</Section>

	<Section title="Debt">
		<div slot="CONTENT">
			<ChartJs labels={data.trendDebt.labels} datasets={$debtDatasets} />
		</div>
	</Section>

	<Section title="Investments">
		<div slot="CONTENT">
			<ChartJs labels={data.trendInvestments.labels} datasets={$investmentsDatasets} />
		</div>
	</Section>

	<Section title="Other assets">
		<div slot="CONTENT">
			<ChartJs labels={data.trendOtherAssets.labels} datasets={$otherAssetsDatasets} />
		</div>
	</Section>
</ScrollView>
