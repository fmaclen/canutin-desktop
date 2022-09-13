<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AccountForm from '../AccountForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { Prisma } from '@prisma/client';
	import type { AddOrUpdateAPIResponse } from '$lib/helpers/forms';

	export let data: PageData;

	const title = data.account.name;
	let account: AddOrUpdateAPIResponse;

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
			if (!account.error.name) {
				$statusBarStore = {
					message: "An error ocurred and the account likely wasn't updated",
					appearance: Appearance.NEGATIVE
				};
			}
		} else {
			$statusBarStore = {
				message: 'The account was updated successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/balanceSheet`);
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Update account">
		<div slot="CONTENT">
			<AccountForm
				{handleSubmit}
				account={data.account}
				selectAccountTypes={data.selectAccountTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				lastBalanceStatement={data.lastBalanceStatement}
				error={account?.error}
				submitButtonLabel="Save"
			/>
		</div>
	</Section>
</ScrollView>
