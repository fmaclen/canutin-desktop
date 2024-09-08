<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { formatCurrency } from '$lib/utils';

	const accountsStore = getAccountsContext();
</script>

<h1>{$LL.ACCOUNTS()}</h1>

<table>
	<thead>
		<tr>
			<th>{$LL.NAME()}</th>
			<th>{$LL.BALANCE()}</th>
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
