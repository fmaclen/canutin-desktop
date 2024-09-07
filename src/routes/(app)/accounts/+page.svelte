<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';

	const accountsStore = getAccountsContext();
</script>

<h1>Accounts</h1>

{#each accountsStore.accounts as account}
	<div class="card">
		<h2>{account.name}</h2>
		{account.balance}
	</div>
{/each}
