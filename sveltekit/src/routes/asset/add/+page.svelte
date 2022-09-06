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

	const title = 'Add asset';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Asset details">
		<div slot="CONTENT" class="balanceSheet">
			<Form>
				<FormFieldset>
					<FormField name="assetType" label="Asset type">
						<FormSelect value={1} options={[{ label: 'toto' }, { label: 'goto' }]} />
					</FormField>
					<FormField name="name" label="Name">
						<FormInput type="text" name="name" />
					</FormField>
					<FormField name="symbol" label="Symbol">
						<FormInput type="text" name="symbol" />
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="quantity" label="Quantity">
						<FormInput type="number" name="quantity" />
					</FormField>
					<FormField name="cost" label="Cost">
						<FormInput type="number" name="cost" />
					</FormField>
					<FormField name="value" label="Value">
						<FormInput type="number" name="value" />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE}>Add asset</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
</style>
