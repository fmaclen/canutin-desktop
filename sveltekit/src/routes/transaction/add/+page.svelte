<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import TransactionForm from '../TransactionForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { AddOrUpdateAPIResponse } from '$lib/helpers/forms';

	export let data: PageData;
	let transaction: AddOrUpdateAPIResponse;

	const handleSubmit = async (event: any) => {
		const payload: Prisma.TransactionUncheckedCreateInput = {
			description: event.target.description?.value,
			date: event.target.date?.value,
			categoryId: parseInt(event.target.transactionCategoryId?.value),
			accountId: parseInt(event.target.accountId?.value),
			value: parseInt(event.target.value?.value),
			isExcluded: event.target.isExcluded?.checked ? true : false,
			isPending: event.target.isPending?.checked ? true : false
		};
		console.log(payload);
		transaction = await api({ endpoint: 'transaction', method: 'POST', payload });

		if (transaction.error) {
			if (!transaction.error.name) {
				$statusBarStore = {
					message: "An error ocurred and the transaction likely wasn't added",
					appearance: Appearance.NEGATIVE
				};
			}
		} else {
			$statusBarStore = {
				message: 'The transaction was added successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/transaction/${transaction.id}`);
		}
	};

	const title = 'Add transaction';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="New transaction">
		<div slot="CONTENT">
			<TransactionForm
				{handleSubmit}
				selectAccounts={data.selectAccounts}
				selectTransactionCategories={data.selectTransactionCategories}
				submitButtonLabel="Add"
			/>
		</div>
	</Section>
</ScrollView>
