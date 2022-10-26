<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import FormEditableField from '$lib/components/FormEditableField.svelte';
	import FormCurrency from '$lib/components/FormCurrency.svelte';
	import FormFieldFlags from '$lib/components/FormFieldFlags.svelte';
	import FormDateInput from '$lib/components/FormDateInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import Link from '$lib/components/Link.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance, UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { CRUDResponse } from '$lib/helpers/prisma';
	// FIXME: I don't think we need to import types from `+server` here
	import type { BatchEditPayload } from 'src/routes/transactions.json/+server';

	export let data: PageData;

	const title = 'Batch editor';

	const {
		batchTransactions,
		selectAccounts,
		selectTransactionCategories,
		hasSharedAccounts,
		hasSharedDescriptions,
		hasSharedCategories,
		hasSharedDates,
		hasSharedIsExcluded,
		hasSharedIsPending,
		hasSharedValues
	} = data;

	let accountId = hasSharedAccounts ? batchTransactions[0].accountId : 0;
	let description = hasSharedDescriptions ? batchTransactions[0].description : '';
	let categoryId = hasSharedCategories ? batchTransactions[0].categoryId : 0;
	let date = hasSharedDates ? batchTransactions[0].date : undefined;
	let isExcluded = hasSharedIsExcluded ? batchTransactions[0].isExcluded : false;
	let isPending = hasSharedIsPending ? batchTransactions[0].isPending : false;
	let value = hasSharedValues ? batchTransactions[0].value : 0;

	let accountIdEdited: boolean = false;
	let descriptionEdited: boolean = false;
	let categoryIdEdited: boolean = false;
	let dateEdited: boolean = false;
	let isExcludedEdited: boolean = false;
	let isPendingEdited: boolean = false;
	let valueEdited: boolean = false;

	$: isSubmitDisabled =
		!accountIdEdited &&
		!descriptionEdited &&
		!categoryIdEdited &&
		!dateEdited &&
		!isExcludedEdited &&
		!isPendingEdited &&
		!valueEdited;

	const handleSubmit = async (event: any) => {
		const updatedProps: Prisma.TransactionUncheckedUpdateManyInput = {
			accountId: accountIdEdited ? accountId : undefined,
			description: descriptionEdited ? description : undefined,
			categoryId: categoryIdEdited ? categoryId : undefined,
			date: dateEdited ? event.target.date?.value : undefined,
			isExcluded: isExcludedEdited ? isExcluded : undefined,
			isPending: isPendingEdited ? isPending : undefined,
			value: valueEdited ? value : undefined
		};

		const payload: BatchEditPayload = {
			transactionIds: batchTransactions.map((t) => t.id),
			updatedProps
		};

		const updatedTransactions = (await api({
			endpoint: 'transactions',
			method: 'PATCH',
			payload
		})) as CRUDResponse;

		if (updatedTransactions.error) {
			$statusBarStore = {
				message: updatedTransactions.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: `The ${batchTransactions.length} transactions were updated successfully`,
				appearance: Appearance.POSITIVE
			};
			await goto('/transactions');
		}
	};

	const handleDelete = async () => {
		const confirmDeletion = window.confirm(
			`${UNDOABLE_ACTION}Are you sure you want to delete the ${batchTransactions.length} transactions?`
		);
		if (!confirmDeletion) return;

		const response: CRUDResponse = await api({
			endpoint: 'transactions',
			method: 'DELETE',
			payload: data.batchTransactions
		});

		if (response.error) {
			$statusBarStore = {
				message: response.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: `${response.payload.count} transactions were deleted successfully`,
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
	<Section title="Update {batchTransactions.length} transactions">
		<div slot="CONTENT">
			<Form on:submit={handleSubmit}>
				<FormFieldset>
					<FormField name="accountId" label="Account">
						<FormEditableField name="accountIdEdit" label="Edit" bind:checked={accountIdEdited}>
							<FormSelect
								name="accountId"
								options={selectAccounts}
								placeholder={hasSharedAccounts ? undefined : 'Multiple accounts'}
								bind:value={accountId}
								disabled={!accountIdEdited}
							/>
						</FormEditableField>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="description" label="Description">
						<FormEditableField name="descriptionEdit" label="Edit" bind:checked={descriptionEdited}>
							<FormInput
								type="text"
								name="description"
								bind:value={description}
								placeholder={hasSharedDescriptions ? undefined : 'Multiple descriptions'}
								disabled={!descriptionEdited}
							/>
						</FormEditableField>
					</FormField>
					<FormField name="categoryId" label="Category">
						<FormEditableField name="categoryIdEdit" label="Edit" bind:checked={categoryIdEdited}>
							<FormSelect
								name="categoryId"
								options={selectTransactionCategories}
								disabled={!categoryIdEdited}
								placeholder={hasSharedCategories ? undefined : 'Multiple categories'}
								bind:value={categoryId}
							/>
						</FormEditableField>
					</FormField>
					<FormField name="date" label="Date">
						<FormEditableField name="dateEdit" label="Edit" bind:checked={dateEdited}>
							{#if !dateEdited && !hasSharedDates}
								<FormInput
									type="text"
									name="placeholderDate"
									placeholder={'Multiple dates'}
									disabled={!dateEdited}
								/>
							{:else}
								<FormDateInput name="date" {date} disabled={!dateEdited} />
							{/if}
						</FormEditableField>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="flags" label="Marked as">
						<FormFieldFlags>
							<FormEditableField name="isExcludedEdit" label="Edit" bind:checked={isExcludedEdited}>
								<FormInputCheckbox
									name="isExcluded"
									label="Excluded from totals"
									disabled={!isExcludedEdited}
									indeterminate={!hasSharedIsExcluded}
									bind:checked={isExcluded}
								/>
							</FormEditableField>
							<FormEditableField name="isPendingEdit" label="Edit" bind:checked={isPendingEdited}>
								<FormInputCheckbox
									name="isPending"
									label="Pending"
									disabled={!isPendingEdited}
									indeterminate={!hasSharedIsPending}
									bind:checked={isPending}
								/>
							</FormEditableField>
						</FormFieldFlags>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="value" label="Amount">
						<FormEditableField name="valueEdit" label="Edit" bind:checked={valueEdited}>
							{#if !valueEdited && !hasSharedDescriptions}
								<FormInput
									type="text"
									name="placeholderValue"
									placeholder={'Multiple amounts'}
									disabled={!valueEdited}
								/>
							{:else}
								<FormCurrency name="value" bind:value disabled={!valueEdited} />
							{/if}
						</FormEditableField>
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Link href="/transactions">Discard</Link>
					<Button appearance={Appearance.ACTIVE} disabled={isSubmitDisabled}>Apply</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>

	<Section title="Danger zone">
		<div slot="CONTENT">
			<DangerZone {handleDelete}>
				Permanently delete <strong>all {data.batchTransactions.length} transactions</strong>
			</DangerZone>
		</div>
	</Section>
</ScrollView>
