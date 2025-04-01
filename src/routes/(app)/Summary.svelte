<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { getAssetsContext } from '$lib/assets.svelte';
	import { BalanceGroup, calculateTotalBalance } from '$lib/balanceGroups';
	import H3 from '$lib/components/H3.svelte';
	import KeyValue from '$lib/components/KeyValue.svelte';
	import Number from '$lib/components/Number.svelte';
	import Plate from '$lib/components/Plate.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
	const assetsStore = getAssetsContext();

	let balanceGroups = $derived.by(() => {
		const accountsOrAssets = [...accountsStore.accounts, ...assetsStore.assets];
		return {
			netWorth: calculateTotalBalance(accountsOrAssets),
			cash: calculateTotalBalance(accountsOrAssets, BalanceGroup.CASH),
			debt: calculateTotalBalance(accountsOrAssets, BalanceGroup.DEBT),
			investments: calculateTotalBalance(accountsOrAssets, BalanceGroup.INVESTMENTS),
			otherAssets: calculateTotalBalance(accountsOrAssets, BalanceGroup.OTHER_ASSETS)
		};
	});
</script>

<Section>
	<H3>{$LL.SUMMARY()}</H3>

	<div class="summary grid grid-cols-3 gap-2">
		<div class="col-span-1 row-span-2">
			<Plate variant="netWorth">
				<div class="summary__net-worth flex h-full flex-col justify-between">
					<p class="p-4 text-sm font-bold">{$LL.NET_WORTH()}</p>
					<p class="px-4 pb-4 font-mono text-3xl font-light">
						<Number>{formatCurrency(balanceGroups.netWorth)}</Number>
					</p>
				</div>
			</Plate>
		</div>

		<Plate variant="cash">
			<div class="summary__cash flex flex-row justify-between">
				<KeyValue key={$LL.CASH()} value={formatCurrency(balanceGroups.cash)} />
			</div>
		</Plate>

		<Plate variant="investments">
			<div class="summary__investments flex flex-row justify-between">
				<KeyValue key={$LL.INVESTMENTS()} value={formatCurrency(balanceGroups.investments)} />
			</div>
		</Plate>

		<Plate variant="debt">
			<div class="summary__debt text-chromeo-50 flex flex-row justify-between">
				<KeyValue key={$LL.DEBT()} value={formatCurrency(balanceGroups.debt)} />
			</div>
		</Plate>

		<Plate variant="otherAssets">
			<div class="summary__other-assets flex flex-row justify-between">
				<KeyValue key={$LL.OTHER_ASSETS()} value={formatCurrency(balanceGroups.otherAssets)} />
			</div>
		</Plate>
	</div>
</Section>
