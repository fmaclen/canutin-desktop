<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import AssetDetails from '../AssetDetails.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { AssetFormPayload } from '$lib/helpers/forms';

	export let data: PageData;

	const updateAsset = async (event: any) => {
		const payload: AssetFormPayload = {
			assetForm: {
				id: data.asset.id,
				name: event.target.name.value,
				symbol: event.target.symbol?.value,
				balanceGroup: parseInt(event.target.balanceGroup.value),
				assetTypeId: parseInt(event.target.assetTypeId.value),
				isSold: event.target.isSold.checked ? true : false
			}
		};
		const asset = await api('asset', payload, 'PATCH');

		if (asset.error) {
			$statusBarStore = {
				message: asset.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: 'The asset was updated successfully',
				appearance: Appearance.POSITIVE
			};
			window.location.reload();
		}
	};

	const createAssetBalanceStatement = async (event: any) => {
		const payload: AssetFormPayload = {
			assetBalanceStatementForm: {
				assetId: data.asset.id,
				value: parseFloat(event.target.value?.value),
				quantity: parseFloat(event.target.quantity?.value),
				cost: parseFloat(event.target.cost?.value)
			}
		};
		const assetBalanceStatement = await api('asset', payload);

		if (assetBalanceStatement.error) {
			$statusBarStore = {
				message: assetBalanceStatement.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: "The asset's balance was updated successfully",
				appearance: Appearance.POSITIVE
			};
		}
	};

	const title = data.asset.name;
	const isQuantifiable = data.quantifiableAssetTypes.includes(data.asset.assetTypeId);
	$: error = '';

	let balanceQuantity = data?.lastBalanceStatement?.quantity?.toString() || '0';
	let balanceCost = data?.lastBalanceStatement?.cost?.toString() || '0';
	$: balanceValue = `${parseFloat(balanceQuantity) * parseFloat(balanceCost)}`;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Current balance">
		<div slot="CONTENT">
			<Form on:submit={createAssetBalanceStatement}>
				<FormFieldset>
					{#if isQuantifiable}
						<FormField name="quantity" label="Quantity">
							<FormInput type="number" name="quantity" bind:value={balanceQuantity} />
						</FormField>
						<FormField name="cost" label="Cost">
							<FormInput type="number" name="cost" bind:value={balanceCost} />
						</FormField>
						<FormField name="value" label="Value">
							<FormInput type="number" name="value" bind:value={balanceValue} disabled={true} />
						</FormField>
					{/if}
					{#if !isQuantifiable}
						<FormField name="value" label="Value">
							<FormInput
								type="number"
								name="value"
								value={data?.lastBalanceStatement?.value?.toString() || '0'}
							/>
						</FormField>
					{/if}
				</FormFieldset>
				<FormFooter>
					<Button disabled={false} appearance={Appearance.ACTIVE}>Save</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>

	<AssetDetails
		handleSubmit={updateAsset}
		asset={data.asset}
		selectAssetTypes={data.selectAssetTypes}
		selectBalanceGroups={data.selectBalanceGroups}
		quantifiableAssetTypes={data.quantifiableAssetTypes}
		nameError={error}
		submitButtonLabel="Save"
	/>
</ScrollView>
