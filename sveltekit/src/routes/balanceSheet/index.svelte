<script lang="ts">
	import { formatCurrency } from '$lib/helpers/misc';
	import type { BalanceSheetBalanceGroup } from '.';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Card from '$lib/components/Card.svelte';
	import Section from '$lib/components/Section.svelte';
	import { balanceGroupAppearance } from '$lib/components/Card';

	const title = 'Balance sheet';

	export let balanceSheetBalanceGroups: BalanceSheetBalanceGroup[];
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Balances">
		<div slot="CONTENT" class="balanceSheet">
			{#each balanceSheetBalanceGroups as balanceSheetItemsByBalanceGroup}
				<div class="balanceSheet__balanceGroup">
					<Card
						title={balanceSheetItemsByBalanceGroup.label}
						value={formatCurrency(balanceSheetItemsByBalanceGroup.currentBalance)}
						appearance={balanceGroupAppearance(balanceSheetItemsByBalanceGroup.id)}
					/>

					{#each balanceSheetItemsByBalanceGroup.balanceItemsTypeGroups as balanceSheetTypeGroup}
						<div class="balanceSheet__typeGroup">
							<header class="balanceSheet__typeHeader">
								<p class="balanceSheet__typeName">{balanceSheetTypeGroup.type}</p>
								<p class="balanceSheet__typeValue">
									{formatCurrency(balanceSheetTypeGroup.currentBalance)}
								</p>
							</header>
							<ol class="balanceSheet__items">
								{#each balanceSheetTypeGroup.balanceSheetItems as balanceSheetItem}
									<li class="balanceSheet__item">
										<p class="balanceSheet__itemName">{balanceSheetItem.name}</p>
										<p class="balanceSheet__itemValue">
											{formatCurrency(balanceSheetItem.currentBalance)}
										</p>
									</li>
								{/each}
							</ol>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.balanceSheet {
		display: flex;
		column-gap: 20px;
	}

	div.balanceSheet__balanceGroup {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
		width: 100%;
		padding-left: 20px;
		border-left: 1px solid var(--color-border);

		&:first-child {
			padding-left: unset;
			border-left: unset;
		}
	}

	div.balanceSheet__typeGroup {
		box-shadow: var(--box-shadow);
		background-color: var(--color-white);
		border-radius: 4px;
	}

	header.balanceSheet__typeHeader {
		display: grid;
		grid-auto-flow: column;
		grid-gap: 16px;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-radius: 4px 4px 0 0;
		border-bottom: 1px dashed var(--color-border);
	}

	p.balanceSheet__typeName {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	p.balanceSheet__typeValue {
		font-family: var(--font-monospace);
		margin: 0;
		font-size: 14px;
		line-height: 1em;
	}

	ol.balanceSheet__items {
		display: flex;
		flex-direction: column;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li.balanceSheet__item {
		display: grid;
		grid-auto-flow: column;
		grid-gap: 16px;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		border-bottom: 1px solid var(--color-border);

		&:nth-child(odd) {
			background-color: var(--color-grey3);
		}

		&:last-child {
			border-bottom-left-radius: 4px;
			border-bottom-right-radius: 4px;
		}
	}

	p.balanceSheet__itemName {
		font-size: 12px;
		margin: 0;
	}

	p.balanceSheet__itemValue {
		font-family: var(--font-monospace);
		margin: 0;
		font-size: 12px;
		line-height: 1em;
	}
</style>
