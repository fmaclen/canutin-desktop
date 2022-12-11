<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AccountForm from '../AccountForm.svelte';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';
	import type { CRUDResponse } from '$lib/helpers/forms';

	export let data: PageData;
	let account: CRUDResponse;
	let referrer = '/accounts';

	afterNavigate(({ from }) => {
		// Redirect to `/accounts` if the referrer came from the "Add or update data" page
		const { pathname } = from?.url || {};
		referrer = pathname && pathname !== '/data' ? pathname : referrer;
	});

	const handleSubmit = async (event: any) => {
		const payload: Prisma.AccountUncheckedCreateInput = {
			name: event.target.name?.value,
			institution: event.target.institution?.value,
			balanceGroup: parseInt(event.target.balanceGroup?.value),
			accountTypeId: parseInt(event.target.accountTypeId?.value),
			isAutoCalculated: event.target.isAutoCalculated?.checked ? true : false,
			isClosed: event.target.isClosed?.checked ? true : false,
			accountBalanceStatements: { create: [{ value: parseFloat(event.target.value?.value) }] }
		};
		account = await api({ endpoint: 'account', method: 'POST', payload });

		if (!account.error) await goto(referrer);
	};

	const title = 'Add account';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="New account">
		<div slot="CONTENT">
			<AccountForm
				{handleSubmit}
				selectAccountTypes={data.selectAccountTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				submitButtonLabel="Add"
			/>
		</div>
	</Section>
</ScrollView>
