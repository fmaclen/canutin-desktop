<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';

	const accountsStore = getAccountsContext();

	let balanceGroups = $derived.by(() => {
		return {
			netWorth: accountsStore.accounts.reduce((acc, account) => acc + (account.balance ?? 0), 0),
			cash: accountsStore.accounts
				.filter((account) => account.balanceGroup === 0)
				.reduce((acc, account) => acc + (account.balance ?? 0), 0),
			debt: accountsStore.accounts
				.filter((account) => account.balanceGroup === 1)
				.reduce((acc, account) => acc + (account.balance ?? 0), 0),
			investments: accountsStore.accounts
				.filter((account) => account.balanceGroup === 2)
				.reduce((acc, account) => acc + (account.balance ?? 0), 0),
			otherAssets: accountsStore.accounts
				.filter((account) => account.balanceGroup === 3)
				.reduce((acc, account) => acc + (account.balance ?? 0), 0)
		};
	});
</script>

<h1>The big picture</h1>

<h2>Summary</h2>

<h3>Net worth</h3>
${balanceGroups.netWorth.toFixed(2)}
<h3>Cash</h3>
${balanceGroups.cash.toFixed(2)}
<h3>Debt</h3>
${balanceGroups.debt.toFixed(2)}
<h3>Investments</h3>
${balanceGroups.investments.toFixed(2)}
<h3>Other assets</h3>
${balanceGroups.otherAssets.toFixed(2)}

<!-- {#if accountsStore.accounts.length > 0}
	<h2>Your Accounts:</h2>
	<ul>
		{#each accountsStore.accounts as account}
			<li>
				<strong>{account.name}</strong><br />
				Balance group: {account.balanceGroup}<br />
				{account.isAutoCalculated ? 'Auto-calculated' : 'Manually-calculated'}<br />
				{#if account.balance !== null}
					${account.balance.toFixed(2)}
				{:else}
					Balance unavailable
				{/if}
			</li>
		{/each}
	</ul>
{:else}
	<p>No accounts found or not logged in.</p>
{/if} -->
