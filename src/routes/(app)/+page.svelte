<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';

	const accountsStore = getAccountsContext();

	const netWorth = accountsStore.accounts.reduce((acc, account) => acc + (account.balance ?? 0), 0);
	const cash = accountsStore.accounts
		.filter((account) => account.balanceGroup === 0)
		.reduce((acc, account) => acc + (account.balance ?? 0), 0);
	const debt = accountsStore.accounts
		.filter((account) => account.balanceGroup === 1)
		.reduce((acc, account) => acc + (account.balance ?? 0), 0);
	const investments = accountsStore.accounts
		.filter((account) => account.balanceGroup === 2)
		.reduce((acc, account) => acc + (account.balance ?? 0), 0);
	const otherAssets = accountsStore.accounts
		.filter((account) => account.balanceGroup === 3)
		.reduce((acc, account) => acc + (account.balance ?? 0), 0);
</script>

<h1>The big picture</h1>

<h2>Summary</h2>

<h3>Net worth</h3>
${netWorth.toFixed(2)}

<h3>Cash</h3>
${cash.toFixed(2)}
<h3>Debt</h3>
${debt.toFixed(2)}
<h3>Investments</h3>
${investments.toFixed(2)}
<h3>Other assets</h3>
${otherAssets.toFixed(2)}

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
