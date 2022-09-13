<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Transaction } from '@prisma/client';
	import Link from '$lib/components/Link.svelte';
	import FormNoticeNotice from '$lib/components/FormNoticeNotice.svelte';
	import FormNoticeP from '$lib/components/FormNoticeP.svelte';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let transaction: Transaction | null = null;
	export let selectAccounts: FormSelectOption[];
	export let selectTransactionCategories: FormSelectOption[];
	export let submitButtonLabel: string;

	let thisYear = transaction?.date ? transaction.date.getFullYear() : new Date().getFullYear();
	const years = [
		// Past 5 years
		...Array.from(Array(15).keys())
			.map((i) => thisYear - 1 - i)
			.reverse(),
		thisYear,
		// Next 5 years
		...Array.from(Array(15).keys()).map((i) => thisYear + 1 + i)
	];

	let thisMonth = transaction?.date ? transaction.date.getMonth() + 1 : new Date().getMonth() + 1;
	let months = Array.from(Array(12).keys()).map((i) => i + 1); // 12 years in a year

	let thisDate = transaction?.date ? transaction.date.getDate() : new Date().getDate();
	const days = Array.from(Array(31).keys()).map((i) => i + 1); // 31 days in a month

	const getDateSelects = (dates: number[]) => {
		const isMonth = dates.length === 12;

		return dates.map((date, i) => {
			return {
				label: isMonth
					? `${date} - ${new Date(`${date}-${thisDate}-${thisYear}`).toLocaleString('en-US', {
							month: 'short'
					  })}` // e.g. "9 - Sep"
					: date.toString(),
				value: date
			};
		});
	};

	let description = transaction ? transaction.description : '';
	let accountId = transaction ? transaction.accountId : 1;
	let categoryId = transaction ? transaction.categoryId : 1;
	let isPending = transaction ? transaction.isPending : false;
	let isExcluded = transaction ? transaction.isExcluded : false;
	let hasNoAccounts = selectAccounts.length < 1;
	$: date = new Date(`${thisYear}-${thisMonth}-${thisDate}`).getTime() / 1000;
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
			<div class="transactionDateField">
				<input type="hidden" name="date" value={date} />
				<FormSelect
					name="yearSelect"
					options={getDateSelects(years)}
					disabled={hasNoAccounts}
					bind:value={thisYear}
				/>
				<FormSelect
					name="monthSelect"
					options={getDateSelects(months)}
					disabled={hasNoAccounts}
					bind:value={thisMonth}
				/>
				<FormSelect
					name="dateSelect"
					options={getDateSelects(days)}
					disabled={hasNoAccounts}
					bind:value={thisDate}
				/>
			</div>
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="flags" label="Marked as">
			<div class="transactionFlags">
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
			</div>
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="value" label="Amount">
			<FormInput
				type="number"
				name="value"
				value={transaction?.value.toString() || '0'}
				disabled={hasNoAccounts}
			/>
		</FormField>
	</FormFieldset>
	<FormFooter>
		<Button disabled={isSubmitDisabled} appearance={Appearance.ACTIVE}>{submitButtonLabel}</Button>
	</FormFooter>
</Form>

<style lang="scss">
	div.transactionFlags {
		display: flex;
		flex-direction: column;
		row-gap: 4px;
	}

	div.transactionDateField {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 4px;
	}
</style>
