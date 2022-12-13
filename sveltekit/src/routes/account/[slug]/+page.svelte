<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';

	import Link from '$lib/components/Link.svelte';
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import ChartBalanceHistory from '$lib/components/ChartBalanceHistory.svelte';
	import AccountForm from '../AccountForm.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import { api } from '$lib/helpers/misc';
	import { UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { CRUDResponse } from '$lib/helpers/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	const title = data.account.name;
	let account: CRUDResponse;
	let referrer = '/accounts';

	afterNavigate(({ from }) => {
		referrer = from?.url.pathname || referrer;
	});

	const handleSubmit = async (event: any) => {
		let payload: Prisma.AccountUncheckedCreateInput = {
			id: data.account.id,
			name: event.target.name?.value,
			institution: event.target.institution?.value,
			balanceGroup: parseInt(event.target.balanceGroup?.value),
			accountTypeId: parseInt(event.target.accountTypeId?.value),
			isAutoCalculated: event.target.isAutoCalculated?.checked ? true : false,
			isClosed: event.target.isClosed?.checked ? true : false,
			accountBalanceStatements: { create: [{ value: parseFloat(event.target.value?.value) }] }
		};
		account = await api({ endpoint: 'account', method: 'PATCH', payload });

		if (!account.error) await goto(referrer);
	};

	const handleDelete = async () => {
		const confirmDeletion = window.confirm(
			`${UNDOABLE_ACTION}Are you sure you want to delete the account and all of it's associated transactions?`
		);
		if (!confirmDeletion) return;

		const deletedAccount = await api({
			endpoint: 'account',
			method: 'DELETE',
			payload: data.account.id
		});

		if (!deletedAccount.error) await goto(referrer);
	};
</script>

<Head title={[title, 'Account']} />

<ScrollView {title}>
	<nav slot="NAV">
		<Link href={`/transactions?keyword=accountId:${data.account.id}&periodPreset=Lifetime`}>
			Transactions ({data.transactionsCount})
		</Link>
	</nav>
	<ChartBalanceHistory balanceHistoryDataset={data.balanceHistoryDataset} labels={data.labels} />

	<Section title="Update account">
		<div slot="CONTENT">
			<AccountForm
				{handleSubmit}
				account={data.account}
				selectAccountTypes={data.selectAccountTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				latestBalance={data.latestBalance}
				submitButtonLabel="Save"
			/>
		</div>
	</Section>

	<Section title="Danger zone">
		<div slot="CONTENT">
			<DangerZone {handleDelete}>
				Permanently delete account <strong>{data.account.name}</strong> (including transactions)
			</DangerZone>
		</div>
	</Section>
</ScrollView>
