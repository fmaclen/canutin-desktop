<script lang="ts">
  import { pbStore } from '$lib/pocketbase';
	import type { AccountsResponse, TransactionsResponse } from '$lib/pocketbase-types';
	import { onMount } from 'svelte';

  let accounts: AccountsResponse[] = [];
  let transactions: TransactionsResponse[] = [];
  
  onMount(async () => {
    accounts = await $pbStore.collection('accounts').getFullList();
    transactions = await $pbStore.collection('transactions').getFullList();
  })

</script>

<h1>The big picture</h1>

accounts:
{#each accounts as account}
<ul>
  <li>
    <strong>{account.name}</strong>
  </li>
    <li>
    {account.id}
  </li>
</ul>
{/each}

transactions:
{#each transactions as transaction}
<ul>
  <li>
    <strong>{transaction.description}</strong>
  </li>
    <li>
    {transaction.id}
  </li>
</ul>
{/each}
