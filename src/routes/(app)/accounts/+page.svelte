<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';

	const accountsStore = getAccountsContext();
</script>

<h1>Accounts</h1>

<pre>{JSON.stringify(accountsStore.accounts, null, 2)}</pre>
