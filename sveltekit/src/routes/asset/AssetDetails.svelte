<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import FormInputCheckbox from '$lib/components/FormInputCheckbox.svelte';
	import Button from '$lib/components/Button.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Asset } from '@prisma/client';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let asset: Asset | null = null;
	export let selectAssetTypes: FormSelectOption[];
	export let selectBalanceGroups: FormSelectOption[];
	export let quantifiableAssetTypes: number[];
	export let nameError: string | undefined;

	let name = asset ? asset.name : '';
	let assetTypeId = asset ? asset.assetTypeId : 1;
	$: isQuantifiable = quantifiableAssetTypes.includes(assetTypeId);
</script>

<Section title="Details">
	<div slot="CONTENT">
		<Form on:submit={handleSubmit}>
			<FormFieldset>
				<FormField name="name" label="Name">
					<FormInput type="text" name="name" bind:value={name} error={nameError} />
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
			{#if asset}
				<FormFieldset>
					<FormField name="isSold" label="Mark as">
						<FormInputCheckbox name="isSold" label="Sold" />
					</FormField>
				</FormFieldset>
			{/if}
			<FormFooter>
				<Button disabled={!name} appearance={Appearance.ACTIVE}>Save</Button>
			</FormFooter>
		</Form>
	</div>
</Section>
