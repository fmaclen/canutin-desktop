<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { goto } from '$app/navigation';
	import { BalanceGroup } from '$lib/balanceGroups';
	import Field from '$lib/components/Field';
	import Head from '$lib/components/Head.svelte';
	import { createAccount, createAccountBalanceStatements } from '$lib/pocketbase';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { NewAccountDetails } from '$lib/seed/data/accounts';

	let newAccount: NewAccountDetails = $state({
		name: '',
		tag: '',
		institution: '',
		balanceGroup: BalanceGroup.CASH,
		isAutoCalculated: false,
		isClosed: false,
		balance: 0
	});

	const pbClient = getPbClientContext();

	async function handleSubmit(e: Event) {
		e.preventDefault();
		const account = await createAccount(pbClient.pb, newAccount);
		await createAccountBalanceStatements(pbClient.pb, account.id, [
			{
				value: newAccount.balance
			}
		]);
		goto(`/accounts`);
	}
</script>

<Head title={$LL.ADD_ACCOUNT()} />

<h1>{$LL.ADD_ACCOUNT()}</h1>

<form onsubmit={handleSubmit}>
	<Field>
		<Field.Label id="name">{$LL.NAME()}</Field.Label>
		<Field.Input id="name" bind:value={newAccount.name} />
	</Field>

	<Field>
		<Field.Label id="institution">{$LL.INSTITUTION()}</Field.Label>
		<Field.Input id="institution" bind:value={newAccount.institution} />
	</Field>

	<Field>
		<Field.Label id="accountTag">{$LL.TAG()}</Field.Label>
		<Field.Select id="accountTag" bind:value={newAccount.tag}>
			<option value="checking">Checking</option>
		</Field.Select>
	</Field>

	<Field>
		<Field.Label id="balance">{$LL.BALANCE()}</Field.Label>
		<Field.Input id="balance" type="number" bind:value={newAccount.balance} />
		<Field.Toggle
			id="isAutoCalculated"
			bind:checked={newAccount.isAutoCalculated}
			label={$LL.AUTO_CALCULATED()}
		/>
	</Field>

	<Field>
		<Field.Label id="balanceGroup">{$LL.BALANCE_GROUP()}</Field.Label>
		<Field.Select id="balanceGroup" bind:value={newAccount.balanceGroup}>
			<option value={BalanceGroup.CASH}>{$LL.CASH()}</option>
			<option value={BalanceGroup.DEBT}>{$LL.DEBT()}</option>
			<option value={BalanceGroup.INVESTMENTS}>{$LL.INVESTMENTS()}</option>
			<option value={BalanceGroup.OTHER_ASSETS}>{$LL.OTHER_ASSETS()}</option>
		</Field.Select>
	</Field>

	<Field>
		<Field.Toggle id="isClosed" bind:checked={newAccount.isClosed} label={$LL.CLOSED()} />
	</Field>

	<button>{$LL.ADD()}</button>
</form>
