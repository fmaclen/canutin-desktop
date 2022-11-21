<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import FormNoticeNotice from '$lib/components/FormNoticeNotice.svelte';
	import FormNoticeP from '$lib/components/FormNoticeP.svelte';
	import FormCurrency from '$lib/components/FormCurrency.svelte';
	import FormFieldFlags from '$lib/components/FormFieldFlags.svelte';
	import Button from '$lib/components/Button.svelte';
	import Link from '$lib/components/Link.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Transaction } from '@prisma/client';
	import FormDateInput from '$lib/components/FormDateInput.svelte';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let transaction: Transaction | null = null;
	export let selectAccounts: FormSelectOption[];
	export let selectTransactionCategories: FormSelectOption[];
	export let submitButtonLabel: string;

	let description = transaction ? transaction.description : '';
	let accountId = transaction ? transaction.accountId : '';
	let categoryId = transaction ? transaction.categoryId : 1;
	let isPending = transaction ? transaction.isPending : false;
	let isExcluded = transaction ? transaction.isExcluded : false;
	let hasNoAccounts = selectAccounts.length < 1;
	$: isSubmitDisabled = !accountId || !description;
</script>

<Form on:submit={handleSubmit}>
	<FormFieldset>
		<FormField name="accountId" label="Account">
			<FormNotice>
				<FormSelect
					name="accountId"
					options={selectAccounts}
					disabled={hasNoAccounts}
					bind:value={accountId}
				/>

				{#if hasNoAccounts}
					<FormNoticeNotice appearance={Appearance.WARNING}>
						<FormNoticeP>
							<strong>At least one account is needed to create a transaction</strong>
						</FormNoticeP>
						<FormNoticeP>
							Your vault doesn't have any dates. <Link href="/account/add">Add a new account</Link>
						</FormNoticeP>
					</FormNoticeNotice>
				{/if}
			</FormNotice>
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="description" label="Description">
			<FormInput type="text" name="description" disabled={hasNoAccounts} bind:value={description} />
		</FormField>
		<FormField name="categoryId" label="Category">
			<FormSelect
				name="categoryId"
				options={selectTransactionCategories}
				disabled={hasNoAccounts}
				bind:value={categoryId}
			/>
		</FormField>
		<FormField name="date" label="Date">
			<FormDateInput name="date" disabled={hasNoAccounts} date={transaction?.date} />
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="flags" label="Marked as">
			<FormFieldFlags>
				<FormInputCheckbox
					name="isExcluded"
					label="Excluded from totals"
					disabled={hasNoAccounts}
					bind:checked={isExcluded}
				/>
				<FormInputCheckbox
					name="isPending"
					label="Pending"
					disabled={hasNoAccounts}
					bind:checked={isPending}
				/>
			</FormFieldFlags>
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="value" label="Amount">
			<FormCurrency name="value" value={transaction?.value || 0} disabled={hasNoAccounts} />
		</FormField>
	</FormFieldset>
	<FormFooter>
		<Button disabled={isSubmitDisabled} appearance={Appearance.ACTIVE}>{submitButtonLabel}</Button>
	</FormFooter>
</Form>
