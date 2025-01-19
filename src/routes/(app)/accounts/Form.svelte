<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAccountsContext } from '$lib/accounts.svelte';
	import { BalanceGroup } from '$lib/balanceGroups';
	import Field from '$lib/components/Field';
	import type { AccountDraft } from '$lib/seed/data/accounts';

	const accountsStore = getAccountsContext();

	interface Props {
		accountDraft: AccountDraft;
		onSubmit: (e: Event) => Promise<void>;
	}

	const { accountDraft = $bindable(), onSubmit = $bindable() }: Props = $props();
</script>

<form onsubmit={onSubmit}>
	<Field>
		<Field.Label id="name">{$LL.NAME()}</Field.Label>
		<Field.Input id="name" bind:value={accountDraft.name} />
	</Field>

	<Field>
		<Field.Label id="institution">{$LL.INSTITUTION()}</Field.Label>
		<Field.Input id="institution" bind:value={accountDraft.institution} />
	</Field>

	<Field>
		<Field.Label id="accountTag">{$LL.TAG()}</Field.Label>
		<Field.Select id="accountTag" bind:value={accountDraft.tag.id}>
			{#each accountsStore.tags as tag}
				<option value={tag.id}>
					{tag.name}
				</option>
			{/each}
		</Field.Select>
	</Field>

	<Field>
		<Field.Label id="balance">{$LL.BALANCE()}</Field.Label>
		<Field.Input id="balance" type="number" bind:value={accountDraft.balance} />
		<Field.Toggle
			id="isAutoCalculated"
			bind:checked={accountDraft.isAutoCalculated}
			label={$LL.AUTO_CALCULATED()}
		/>
	</Field>

	<Field>
		<Field.Label id="balanceGroup">{$LL.BALANCE_GROUP()}</Field.Label>
		<Field.Select id="balanceGroup" bind:value={accountDraft.balanceGroup}>
			<option value={BalanceGroup.CASH}>{$LL.CASH()}</option>
			<option value={BalanceGroup.DEBT}>{$LL.DEBT()}</option>
			<option value={BalanceGroup.INVESTMENTS}>{$LL.INVESTMENTS()}</option>
			<option value={BalanceGroup.OTHER_ASSETS}>{$LL.OTHER_ASSETS()}</option>
		</Field.Select>
	</Field>

	<Field>
		<Field.Toggle id="isClosed" bind:checked={accountDraft.isClosed} label={$LL.CLOSED()} />
	</Field>

	<button>{accountDraft.id ? $LL.UPDATE() : $LL.ADD()}</button>
</form>
