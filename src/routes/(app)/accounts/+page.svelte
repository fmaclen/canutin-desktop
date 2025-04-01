<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { format } from 'date-fns';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import A from '$lib/components/A.svelte';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatCurrency } from '$lib/utils';
	import Number from '$lib/components/Number.svelte';

	const accountsStore = getAccountsContext();
</script>

<Head title={$LL.ACCOUNTS()} />

<MainHeader>
	<H1>{$LL.ACCOUNTS()}</H1>
	<nav class="flex gap-4">
		<A href="/accounts/new">{$LL.ADD_ACCOUNT()}</A>
		<A href="/data">{$LL.IMPORT()}</A>
	</nav>
</MainHeader>

<Section>
	{#if !accountsStore.accounts.length}
		<Notice>{$LL.NO_ACCOUNTS_FOUND()}</Notice>
	{:else}
		<table class="text-sm">
			<thead>
				<tr>
					<th>{$LL.NAME()}</th>
					<th>{$LL.INSTITUTION()}</th>
					<th>{$LL.ACCOUNT_TYPE()}</th>
					<th>{$LL.BALANCE_TYPE()}</th>
					<th>{$LL.BALANCE()}</th>
					<th>{$LL.LAST_UPDATED()}</th>
				</tr>
			</thead>
			<tbody>
				{#each accountsStore.accounts as account}
					<tr>
						<td><a href="/accounts/{account.id}">{account.name}</a></td>
						<td>{account.institution}</td>
						<td>{account.expand.tag.name}</td>
						<td>{account.isAutoCalculated ? $LL.AUTO_CALCULATED() : '~'}</td>
						<td><Number>{formatCurrency(account.balance ?? 0, 2, 2)}</Number></td>
						<td><Number>{format(account.updated, 'MMM d, yyyy')}</Number></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Section>
