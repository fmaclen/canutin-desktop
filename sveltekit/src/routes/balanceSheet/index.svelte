<script lang="ts">
	import { formatCurrency } from '$lib/helpers/misc';
	import type { BalanceSheetBalanceGroup } from '.';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Card from '$lib/components/Card.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionTitle from '$lib/components/SectionTitle.svelte';
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
						<Section title={balanceSheetTypeGroup.type}>
							<SectionTitle
								slot="HEADER"
								title={formatCurrency(balanceSheetTypeGroup.currentBalance)}
							/>

							<div slot="CONTENT" class="balanceSheetTypeGroup">
								{#each balanceSheetTypeGroup.balanceSheetItems as balanceSheetItem}
									<Card
										title={balanceSheetItem.name}
										value={formatCurrency(balanceSheetItem.currentBalance)}
									/>
								{/each}
							</div>
						</Section>
					{/each}
				</div>
			{/each}
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.balanceSheet {
		display: flex;
		column-gap: 32px;
	}

	div.balanceSheet__balanceGroup {
		display: flex;
		flex-direction: column;
		row-gap: 24px;
		width: 100%;
	}

	div.balanceSheetTypeGroup {
		display: flex;
		flex-direction: column;
		row-gap: 4px;
	}
</style>
