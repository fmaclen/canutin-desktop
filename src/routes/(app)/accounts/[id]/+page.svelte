<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { onMount } from 'svelte';

	import { goto } from '$app/navigation';
	import { getAccountsContext } from '$lib/accounts.svelte';
	import Head from '$lib/components/Head.svelte';
	import { createAccountBalanceStatements } from '$lib/pocketbase';
	import { getPbClientContext } from '$lib/pocketbase.svelte';
	import type { AccountDraft } from '$lib/seed/data/accounts';

	import Form from '../Form.svelte';
	import type { PageData } from './$types';

	const pbClient = getPbClientContext();
	const accountsStore = getAccountsContext();

	let { data }: { data: PageData } = $props();
	let accountDraft: AccountDraft | undefined = $state();

	onMount(async () => {
		try {
			const account = await accountsStore.getAccount(data.accountId);
			if (!account.tag) throw new Error('Account not found');

			accountDraft = {
				...account,
				tag: { id: account.tag, name: '' },
				balance: account.balance ?? 0
			};
		} catch {
			goto('/404');
		}
	});

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (!accountDraft?.id || !accountDraft.tag.id)
			throw new Error("Account and tag id's are required to update an account");

		if (accountDraft.balance) {
			await createAccountBalanceStatements(pbClient.pb, accountDraft.id, [
				{ value: accountDraft.balance }
			]);
		}

		await pbClient.pb.collection('accounts').update(accountDraft.id, {
			...accountDraft,
			tag: accountDraft.tag.id,
			owner: pbClient.pb.authStore.model?.id
		});
		goto(`/accounts`);
	}
</script>

<Head title={accountDraft?.name ? [accountDraft.name, $LL.ACCOUNT()] : 'Loading'} />

{#if accountDraft}
	<h1>{accountDraft.name}</h1>

	<Form bind:accountDraft {onSubmit} />
{/if}
