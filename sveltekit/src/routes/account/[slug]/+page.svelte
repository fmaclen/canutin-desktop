<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AccountForm from '../AccountForm.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance, UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { Prisma } from '@prisma/client';
	import type { CRUDResponse } from '$lib/helpers/forms';
	import ChartJs from '$lib/components/ChartJS.svelte';
	import Notice from '$lib/components/Notice.svelte';

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

		if (account.error) {
			$statusBarStore = {
				message: account.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: 'The account was updated successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(referrer);
		}
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

		if (deletedAccount.error) {
			$statusBarStore = {
				message: deletedAccount.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: `The account —${data.account.name}— was deleted successfully`,
				appearance: Appearance.ACTIVE
			};
			await goto(referrer);
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Balance history">
		<div slot="CONTENT">
			{#if data.balanceHistoryDataset.data.length > 0}
				<ChartJs labels={data.labels} datasets={[data.balanceHistoryDataset]} />
			{:else}
				<Notice>This account doesn't have any balances to graph</Notice>
			{/if}
		</div>
	</Section>

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
