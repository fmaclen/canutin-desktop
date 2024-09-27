<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';
	import { getAssetsContext } from '$lib/assets.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
	const assetsStore = getAssetsContext();

	function calculateBalanceGroupTotal(balanceGroup?: number) {
		const accountsInBalanceGroupTotal = accountsStore.accounts
			.filter((account) => balanceGroup === undefined || account.balanceGroup === balanceGroup)
			.reduce((acc, account) => acc + (account.balance ?? 0), 0);
		const assetsInBalanceGroupTotal = assetsStore.assets
			.filter((asset) => balanceGroup === undefined || asset.balanceGroup === balanceGroup)
			.reduce((acc, asset) => acc + (asset.balance ?? 0), 0);
		return formatCurrency(accountsInBalanceGroupTotal + assetsInBalanceGroupTotal);
	}

	let balanceGroups = $derived.by(() => {
		return {
			netWorth: calculateBalanceGroupTotal(),
			cash: calculateBalanceGroupTotal(0),
			debt: calculateBalanceGroupTotal(1),
			investments: calculateBalanceGroupTotal(2),
			otherAssets: calculateBalanceGroupTotal(3)
		};
	});
</script>


<h3>Summary</h3>

<div class="card">
	<h2>Net worth</h2>
	{balanceGroups.netWorth}
</div>

<div class="card">
	<h2>Cash</h2>
	{balanceGroups.cash}
</div>

<div class="card">
	<h2>Debt</h2>
	{balanceGroups.debt}
</div>

<div class="card">
	<h2>Investments</h2>
	{balanceGroups.investments}
</div>

<div class="card">
	<h2>Other assets</h2>
	{balanceGroups.otherAssets}
</div>
