<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import Button from '$lib/components/Button.svelte';
	import AccountForm from '../AccountForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { Prisma } from '@prisma/client';

	export let data: PageData;

	const title = data.account.name;
	let isAutoCalculated = data.account.isAutoCalculated;
	$: error = '';

	const handleSubmit = async (event: any) => {
		let payload: Prisma.AccountUncheckedCreateInput = {
			id: data.account.id,
			name: event.target.name.value,
			institution: event.target.institution?.value,
			balanceGroup: parseInt(event.target.balanceGroup.value),
			accountTypeId: parseInt(event.target.accountTypeId.value),
			isAutoCalculated: event.target.isAutoCalculated.checked ? true : false,
			isClosed: event.target.isClosed.checked ? true : false
		};

		// Create a new account's balance statement
		if (!isAutoCalculated && event.target.value?.value) {
			payload = {
				...payload,
				accountBalanceStatements: { create: [{ value: parseFloat(event.target.value.value) }] }
			};
		}

		const account = await api({ endpoint: 'account', method: 'PATCH', payload });

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
			window.location.reload();
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
				nameError={error}
				submitButtonLabel="Save"
			/>
		</div>
	</Section>
</ScrollView>
