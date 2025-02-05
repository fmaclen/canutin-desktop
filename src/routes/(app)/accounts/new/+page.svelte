<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { goto } from '$app/navigation';
	import { BalanceGroup } from '$lib/balanceGroups';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import { createAccount, createAccountBalanceStatements } from '$lib/pocketbase';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { AccountDraft } from '$lib/seed/data/accounts';

	import Form from '../Form.svelte';

	const pbClient = getPbClientContext();

	let accountDraft: AccountDraft = $state({
		name: '',
		institution: '',
		balanceGroup: BalanceGroup.CASH,
		isAutoCalculated: false,
		isClosed: false,
		balance: 0,
		tag: { name: '', id: '' }
	});

	async function onSubmit(e: Event) {
		e.preventDefault();
		const account = await createAccount(pbClient.pb, accountDraft);
		await createAccountBalanceStatements(pbClient.pb, account.id, [
			{
				value: accountDraft.balance ?? 0
			}
		]);
		goto(`/accounts`);
	}
</script>

<Head title={$LL.ADD_ACCOUNT()} />

<MainHeader>
	<H1>{$LL.ADD_ACCOUNT()}</H1>
</MainHeader>

<Form bind:accountDraft {onSubmit} />
