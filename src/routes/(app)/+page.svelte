<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();

	function calculateBalanceGroupTotal(balanceGroup?: number) {
		const rawTotal = accountsStore.accounts
			.filter((account) => balanceGroup === undefined || account.balanceGroup === balanceGroup)
			.reduce((acc, account) => acc + (account.balance ?? 0), 0);

		return formatCurrency(rawTotal);
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

<h1>The big picture</h1>

<h2>Summary</h2>

<h3>Net worth</h3>
{balanceGroups.netWorth}
<h3>Cash</h3>
{balanceGroups.cash}
<h3>Debt</h3>
{balanceGroups.debt}
<h3>Investments</h3>
{balanceGroups.investments}
<h3>Other assets</h3>
{balanceGroups.otherAssets}
