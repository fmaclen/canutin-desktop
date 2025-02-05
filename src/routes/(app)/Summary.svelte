<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { getAssetsContext } from '$lib/assets.svelte';
	import { BalanceGroup, calculateTotalBalance } from '$lib/balanceGroups';
	import H3 from '$lib/components/H3.svelte';
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

	<div class="summary">
		<div class="card">
			{$LL.NET_WORTH()}
			<p>{formatCurrency(balanceGroups.netWorth)}</p>
		</div>

		<div class="card">
			{$LL.CASH()}
			<p>{formatCurrency(balanceGroups.cash)}</p>
		</div>

		<div class="card">
			{$LL.DEBT()}
			<p>{formatCurrency(balanceGroups.debt)}</p>
		</div>

		<div class="card">
			{$LL.INVESTMENTS()}
			<p>{formatCurrency(balanceGroups.investments)}</p>
		</div>

		<div class="card">
			{$LL.OTHER_ASSETS()}
			<p>{formatCurrency(balanceGroups.otherAssets)}</p>
		</div>
	</div>
</Section>
