<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
</script>

<h1>Accounts</h1>

{accountsStore.accounts.length}
<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Balance</th>
		</tr>
	</thead>
	<tbody>
		{#each accountsStore.accounts as account}
			<tr>
				<td>{account.name}</td>
				<td>{formatCurrency(account.balance ?? 0)}</td>
			</tr>
		{/each}
	</tbody>
</table>
