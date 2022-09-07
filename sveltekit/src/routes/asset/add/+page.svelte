<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	export let data: PageData;

	$: name = '';
	$: chosenAssetType = 1;
	$: chosenBalanceGroup = 0;
	$: isQuantifiable = data.quantifiableAssetTypes.includes(chosenAssetType);
	$: quantity = '';
	$: cost = '';
	$: value = isQuantifiable ? `${parseInt(quantity) * parseInt(cost)}` : '';
	$: error = '';
	$: isSubmittable =
		isQuantifiable && name && quantity && cost ? true : name && value ? true : false;

	const handleSubmit = async (event: any) => {
		const response = await fetch('/asset.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: event.target.name.value,
				symbol: event.target.symbol?.value,
				balanceGroup: chosenBalanceGroup,
				assetTypeId: chosenAssetType,
				quantity: parseInt(quantity),
				cost: parseInt(cost),
				value: parseInt(value)
			})
		});
		const asset = await response.json();

		if (asset.error) {
			error = asset.error;
		} else {
			alert(`Asset created! (Id: ${asset.id})`);
		}
	};

	const title = 'Add asset';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Asset details">
		<div slot="CONTENT">
			<Form on:submit={handleSubmit}>
				<FormFieldset>
					<FormField name="assetType" label="Asset type">
						<FormSelect options={data.assetTypes} bind:value={chosenAssetType} />
					</FormField>
					<FormField name="balanceGroup" label="Balance group">
						<FormSelect options={data.balanceGroups} bind:value={chosenBalanceGroup} />
					</FormField>
					<FormField name="name" label="Name">
						<FormInput type="text" name="name" bind:value={name} {error} />
					</FormField>
					{#if isQuantifiable}
						<FormField name="symbol" label="Symbol" optional={true}>
							<FormInput type="text" name="symbol" required={false} />
						</FormField>
					{/if}
				</FormFieldset>
				<FormFieldset>
					{#if isQuantifiable}
						<FormField name="quantity" label="Quantity">
							<FormInput type="number" name="quantity" bind:value={quantity} />
						</FormField>
						<FormField name="cost" label="Cost">
							<FormInput type="number" name="cost" bind:value={cost} />
						</FormField>
					{/if}
					<FormField name="value" label="Value">
						<FormInput type="number" name="value" disabled={isQuantifiable} bind:value />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button disabled={!isSubmittable} appearance={Appearance.ACTIVE}>Add asset</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
</style>
