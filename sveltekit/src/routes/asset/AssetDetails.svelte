<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import Section from '$lib/components/Section.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { FormSelectOption } from '$lib/components/FormSelect';
	import type { Asset } from '@prisma/client';

	export let handleSubmit: (e: SubmitEvent) => void;
	export let asset: Asset | null = null;
	export let selectAssetTypes: FormSelectOption[];
	export let selectBalanceGroups: FormSelectOption[];
	export let quantifiableAssetTypes: number[];
	export let nameError: string | undefined;

	$: name = asset ? asset.name : '';
	$: assetTypeId = asset ? asset.assetTypeId : 1;
	$: balanceGroup = asset ? asset.balanceGroup : 0;
	$: symbol = asset ? asset.symbol : '';
	$: isQuantifiable = quantifiableAssetTypes.includes(assetTypeId);
</script>

<Section title="Asset details">
	<div slot="CONTENT">
		<Form on:submit={handleSubmit}>
			<FormFieldset>
				<FormField name="assetType" label="Asset type">
					<FormSelect name="assetTypeId" options={selectAssetTypes} bind:value={assetTypeId} />
				</FormField>
				<FormField name="balanceGroup" label="Balance group">
					<FormSelect name="balanceGroup" options={selectBalanceGroups} bind:value={balanceGroup} />
				</FormField>
			</FormFieldset>
			<FormFieldset>
				<FormField name="name" label="Name">
					<FormInput type="text" name="name" bind:value={name} error={nameError} />
				</FormField>
				{#if isQuantifiable}
					<FormField name="symbol" label="Symbol" optional={true}>
						<FormInput type="text" name="symbol" required={false} bind:value={symbol} />
					</FormField>
				{/if}
			</FormFieldset>
			<FormFooter>
				<Button disabled={!name} appearance={Appearance.ACTIVE}>Save</Button>
			</FormFooter>
		</Form>
	</div>
</Section>
