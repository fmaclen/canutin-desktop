<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Card from '$lib/components/Card.svelte';
	import Section from '$lib/components/Section.svelte';
	import Link from '$lib/components/Link.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import { balanceGroupAppearance } from '$lib/components/Card';
	import { formatCurrency } from '$lib/helpers/misc';
	import type { PageData } from './$types';
	import Plate from '../../lib/components/Plate.svelte';

	const title = 'Balance sheet';

	export let data: PageData;

	const isVaultEmpty =
		data.balanceSheetBalanceGroups.filter((groups) => groups.balanceItemsTypeGroups.length !== 0)
			.length === 0;
</script>

<Head {title} />

<ScrollView {title}>
	<nav slot="NAV">
		<Link href="/account/add">Add account</Link>
		<Link href="/asset/add">Add asset</Link>
		<Link href="/import">Import</Link>
	</nav>
	<Section title="Balances">
		<div slot="CONTENT" class="balanceSheet">
			<div class="balanceSheet__groups">
				{#each data.balanceSheetBalanceGroups as balanceSheetItemsByBalanceGroup}
					<div class="balanceSheet__balanceGroup">
						<Card
							title={balanceSheetItemsByBalanceGroup.label}
							value={formatCurrency(balanceSheetItemsByBalanceGroup.currentBalance)}
							appearance={balanceGroupAppearance(balanceSheetItemsByBalanceGroup.id)}
						/>

						{#each balanceSheetItemsByBalanceGroup.balanceItemsTypeGroups as balanceSheetTypeGroup}
							<Plate dataTestId="balance-sheet-type-group">
								<header class="balanceSheet__typeHeader">
									<p class="balanceSheet__typeName">{balanceSheetTypeGroup.type}</p>
									<p class="balanceSheet__typeValue">
										{formatCurrency(balanceSheetTypeGroup.currentBalance)}
									</p>
								</header>
								<ol class="balanceSheet__items">
									{#each balanceSheetTypeGroup.balanceSheetItems as balanceSheetItem}
										<li class="balanceSheet__item">
											<p class="balanceSheet__itemName">
												<Link
													href={`/${balanceSheetItem.isAccount ? 'account' : 'asset'}/${
														balanceSheetItem.id
													}`}>{balanceSheetItem.name}</Link
												>
											</p>
											<p class="balanceSheet__itemValue">
												{formatCurrency(balanceSheetItem.currentBalance)}
											</p>
										</li>
									{/each}
								</ol>
							</Plate>
						{/each}
					</div>
				{/each}
			</div>

			{#if isVaultEmpty}
				<Notice>
					You can add accounts and assets to your balance sheet by clicking the links above
				</Notice>
			{/if}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.balanceSheet {
		--gap: 20px;

		display: flex;
		flex-direction: column;
		gap: var(--gap);
	}

	div.balanceSheet__groups {
		display: flex;
		column-gap: var(--gap);
	}

	div.balanceSheet__balanceGroup {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
		width: 100%;
		padding-left: var(--gap);
		border-left: 1px solid var(--color-border);

		&:first-child {
			padding-left: unset;
			border-left: unset;
		}
	}

	header.balanceSheet__typeHeader {
		display: grid;
		grid-auto-flow: column;
		grid-gap: 16px;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-radius: 4px 4px 0 0;
		border-bottom: 1px solid var(--color-border);
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
		border-bottom: 1px dashed var(--color-border);

		&:nth-child(odd) {
			background-color: var(--color-grey3);
		}

		&:last-child {
			border-bottom-left-radius: 4px;
			border-bottom-right-radius: 4px;
			border-bottom: none;
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
