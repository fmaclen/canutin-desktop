<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import A from '$lib/components/A.svelte';
	import Currency from '$lib/components/Currency.svelte';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';

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
						<td>
							<Currency
								value={account.balance}
								currency="USD"
								locale="en-US"
								maximumFractionDigits={2}
								minimumFractionDigits={2}
							/>
						</td>
						<td><Timestamp date={new Date(account.updated)} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Section>
