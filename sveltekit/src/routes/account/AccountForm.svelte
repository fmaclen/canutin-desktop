<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import FormCurrency from '$lib/components/FormCurrency.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Account, AccountBalanceStatement } from '@prisma/client';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let account: Account | null = null;
	export let selectAccountTypes: FormSelectOption[];
	export let selectBalanceGroups: FormSelectOption[];
	export let lastBalanceStatement: AccountBalanceStatement | null = null;
	export let submitButtonLabel: string;
	export let error: any | null = null;

	let name = account ? account.name : '';
	let accountTypeId = account ? account.accountTypeId : 1;
	let isClosed = account ? account.isClosed : false;
	let isAutoCalculated = account ? account.isAutoCalculated : false;
</script>

<Form on:submit={handleSubmit}>
	<FormFieldset>
		<FormField name="name" label="Name">
			<FormInput type="text" name="name" bind:value={name} />
		</FormField>
		<FormField name="accountTypeId" label="Account type">
			<FormSelect name="accountTypeId" options={selectAccountTypes} bind:value={accountTypeId} />
		</FormField>
		<FormField name="balanceGroup" label="Balance group">
			<FormSelect
				name="balanceGroup"
				options={selectBalanceGroups}
				value={account?.balanceGroup || 0}
			/>
		</FormField>
		<FormField name="institution" label="Institution" optional={true}>
			<FormInput type="text" name="institution" value={account?.institution} required={false} />
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="isClosed" label="Mark as">
			<FormInputCheckbox name="isClosed" label="Closed" bind:checked={isClosed} />
		</FormField>
	</FormFieldset>
	<FormFieldset>
		<FormField name="value" label="Balance">
			<div class="accountBalanceField">
				<FormCurrency
					name="value"
					value={lastBalanceStatement?.value || 0}
					required={!isAutoCalculated}
					disabled={isAutoCalculated}
				/>
				<FormInputCheckbox
					name="isAutoCalculated"
					label="Auto-calculate from transactions"
					bind:checked={isAutoCalculated}
				/>
			</div>
		</FormField>
	</FormFieldset>
	<FormFooter>
		<Button disabled={!name} appearance={Appearance.ACTIVE}>{submitButtonLabel}</Button>
	</FormFooter>
</Form>

<style lang="scss">
	div.accountBalanceField {
		display: grid;
		grid-template-columns: minmax(96px, 1fr) 2fr;
		grid-gap: 8px;
	}
</style>
