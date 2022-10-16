<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import TransactionForm from '../TransactionForm.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance, UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { Prisma } from '@prisma/client';
	import type { AddOrUpdateAPIResponse } from '$lib/helpers/forms';

	export let data: PageData;

	const title = data.transaction.description;
	let transaction: AddOrUpdateAPIResponse; // FIXME: should be CRUDResponse

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
			$statusBarStore = {
				message: transaction.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: 'The transaction was updated successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/transactions?highlight=${data.transaction.id}`);
		}
	};

	const handleDelete = async () => {
		const confirmDeletion = window.confirm(
			`${UNDOABLE_ACTION}Are you sure you want to delete the transaction?`
		);
		if (!confirmDeletion) return;

		const deletedTransaction = await api({
			endpoint: 'transaction',
			method: 'DELETE',
			payload: data.transaction.id
		});

		if (deletedTransaction.error) {
			$statusBarStore = {
				message: deletedTransaction.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: `The transaction —${data.transaction.description}— was deleted successfully`,
				appearance: Appearance.ACTIVE
			};
			await goto('/transactions');
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

	<Section title="Danger zone">
		<div slot="CONTENT">
			<DangerZone {handleDelete}>
				Permanently delete transaction <strong>{data.transaction.description}</strong>
			</DangerZone>
		</div>
	</Section>
</ScrollView>
