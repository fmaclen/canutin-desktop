<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import TransactionForm from '../TransactionForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { Prisma } from '@prisma/client';
	import type { AddOrUpdateAPIResponse } from '$lib/helpers/forms';

	export let data: PageData;

	const title = data.transaction.description;
	let transaction: AddOrUpdateAPIResponse;

	const handleSubmit = async (event: any) => {
		let payload: Prisma.TransactionUncheckedCreateInput = {
			id: data.transaction.id,
			description: event.target.description?.value,
			date: event.target.date?.value,
			categoryId: parseInt(event.target.categoryId?.value),
			accountId: parseInt(event.target.accountId?.value),
			value: parseFloat(event.target.value?.value),
			isExcluded: event.target.isExcluded?.checked ? true : false,
			isPending: event.target.isPending?.checked ? true : false
		};
		transaction = await api({ endpoint: 'transaction', method: 'PATCH', payload });

		if (transaction.error) {
			console.log(transaction.error);
			if (!transaction.error.name) {
				$statusBarStore = {
					message: "An error ocurred and the transaction likely wasn't updated",
					appearance: Appearance.NEGATIVE
				};
			}
		} else {
			$statusBarStore = {
				message: 'The transaction was updated successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/transactions?highlight=${data.transaction.id}`);
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Update transaction">
		<div slot="CONTENT">
			<TransactionForm
				{handleSubmit}
				transaction={data.transaction}
				selectAccounts={data.selectAccounts}
				selectTransactionCategories={data.selectTransactionCategories}
				submitButtonLabel="Save"
			/>
		</div>
	</Section>
</ScrollView>
