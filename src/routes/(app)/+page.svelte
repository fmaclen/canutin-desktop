<script lang="ts">
	import { getAccountsContext } from '$lib/accounts.svelte';

	const accountsStore = getAccountsContext();
</script>

<h1>The big picture</h1>

{#if accountsStore.accounts}
	<h2>Your Accounts:</h2>
	<ul>
		{#each accountsStore.accounts as account}
			<li>{account.name}</li>
		{/each}
	</ul>
{:else}
	<p>No accounts found or not logged in.</p>
{/if}
