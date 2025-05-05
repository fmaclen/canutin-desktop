<script lang="ts">
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import FormCurrency from '$lib/components/FormCurrency.svelte';
	import FormFieldFlags from '$lib/components/FormFieldFlags.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Asset, AssetBalanceStatement } from '@prisma/client';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let asset: Asset | null = null;
	export let selectAssetTypes: FormSelectOption[];
	export let selectBalanceGroups: FormSelectOption[];
	export let quantifiableAssetTypes: number[];
	export let lastBalanceStatement: AssetBalanceStatement | null = null;
	export let submitButtonLabel: string;

	let name = asset ? asset.name : '';
	let assetTypeId = asset ? asset.assetTypeId : 1;
	let isSold = asset ? asset.isSold : false;
	let isExcludedFromNetWorth = asset ? asset.isExcludedFromNetWorth : false;
	let balanceQuantity = lastBalanceStatement?.quantity || 0;
	let balanceCost = lastBalanceStatement?.cost || 0;
	$: isQuantifiable = quantifiableAssetTypes.includes(assetTypeId);
	$: balanceValue = balanceQuantity * balanceCost;
</script>

<Form on:submit={handleSubmit}>
	<FormFieldset>
		<FormField name="name" label="Name">
			<FormInput type="text" name="name" bind:value={name} />
		</FormField>
		<FormField name="assetTypeId" label="Asset type">
			<FormSelect name="assetTypeId" options={selectAssetTypes} bind:value={assetTypeId} />
		</FormField>
		<FormField name="balanceGroup" label="Balance group">
			<FormSelect
				name="balanceGroup"
				options={selectBalanceGroups}
				value={asset?.balanceGroup || 0}
			/>
		</FormField>
		{#if isQuantifiable}
			<FormField name="symbol" label="Symbol" optional={true}>
				<FormInput type="text" name="symbol" required={false} value={asset?.symbol} />
			</FormField>
		{/if}
	</FormFieldset>
	<FormFieldset>
		<FormField name="flags" label="Marked as">
			<FormFieldFlags>
				<FormInputCheckbox name="isExcludedFromNetWorth" label="Exclude from net worth" bind:checked={isExcludedFromNetWorth} />
				<FormInputCheckbox name="isSold" label="Sold" bind:checked={isSold} />
			</FormFieldFlags>
		</FormField>
	</FormFieldset>
	<FormFieldset>
		{#if isQuantifiable}
			<FormField name="quantity" label="Quantity">
				<FormInput type="number" name="quantity" bind:value={balanceQuantity} />
			</FormField>
			<FormField name="cost" label="Cost">
				<FormCurrency name="cost" bind:value={balanceCost} isNegativeAllowed={false} />
			</FormField>
			<FormField name="value" label="Value">
				<FormCurrency name="value" bind:value={balanceValue} disabled={isQuantifiable} />
			</FormField>
		{/if}
		{#if !isQuantifiable}
			<FormField name="value" label="Value">
				<FormCurrency name="value" value={lastBalanceStatement?.value || 0} />
			</FormField>
		{/if}
	</FormFieldset>
	<FormFooter>
		<Button disabled={!name} appearance={Appearance.ACTIVE}>{submitButtonLabel}</Button>
	</FormFooter>
</Form>
