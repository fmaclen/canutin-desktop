<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { goto } from '$app/navigation';
	import { getAccountsContext } from '$lib/accounts.svelte';
	import { BalanceGroup } from '$lib/balanceGroups';
	import Head from '$lib/components/Head.svelte';
	import type { AccountDraft } from '$lib/seed/data/accounts';

	import Form from '../Form.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const accounts = getAccountsContext();
	let accountDraft: AccountDraft = $state({
		name: '',
		institution: '',
		balanceGroup: BalanceGroup.CASH,
		isAutoCalculated: false,
		isClosed: false,
		balance: 0,
		tag: { name: '', id: '' }
	});

	$effect(() => {
		const account = accounts.accounts.find((a) => a.id === data.accountId);
		if (account) {
			accountDraft = {
				...account,
				tag: { name: account.expand.tag.name ?? '', id: account.expand.tag.id ?? '' },
				balance: account.balance ?? 0
			};
		} else {
			goto('/404');
		}
	});

	async function onSubmit(e: Event) {
		e.preventDefault();
		// TODO
		goto(`/accounts`);
	}
</script>

<Head title={[accountDraft.name, $LL.ACCOUNT()]} />

<h1>{accountDraft.name}</h1>

<Form {accountDraft} {onSubmit} />
