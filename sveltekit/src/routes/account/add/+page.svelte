<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AccountForm from '../AccountForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	export let data: PageData;
	$: nameError = '';

	const handleSubmit = async (event: any) => {
		const payload: AccountInput = {
			name: event.target.name.value,
			institution: event.target.institution?.value,
			balanceGroup: parseInt(event.target.balanceGroup.value),
			accountTypeId: parseInt(event.target.accountTypeId.value),
			isAutoCalculated: event.target.isAutoCalculated.checked ? true : false,
			isClosed: event.target.isClosed.checked ? true : false
		};
		const account = await api({ endpoint: 'account', method: 'POST', payload });

		if (account.error) {
			nameError = account.error.name;
		} else {
			$statusBarStore = {
				message: 'The account was added successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/account/${account.id}`);
		}
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
				{nameError}
				submitButtonLabel="Add"
			/>
		</div>
	</Section>
</ScrollView>
