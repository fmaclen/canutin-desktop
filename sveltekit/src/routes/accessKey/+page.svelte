<script lang="ts">
	import { goto } from '$app/navigation';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import isAppReadyStore from '$lib/stores/isAppReadyStore';
	import Form from '$lib/components/Form.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import { ACCESS_KEY_COOKIE_NAME, Appearance } from '$lib/helpers/constants';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';

	const title = 'Access key';

	export let data: PageData;
	$isAppReadyStore = false;

	let accessKeyValue = '';
	let error = '';

	const handleAccessKeyForm = async (event: any) => {
		try {
			const response = await api({
				endpoint: 'accessKey',
				method: 'POST',
				payload: event?.target?.accessKey?.value
			});
			// FIXME: import cookie from helpers
			document.cookie = `${ACCESS_KEY_COOKIE_NAME}${response}; path=/; max-age=31536000; SameSite=Lax;`;
			$isAppReadyStore = true;
			await goto('/');
		} catch (e) {
			error = 'Invalid access key';
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title} isFullscreen={true}>
	<Section title="Enter key to continue">
		<div slot="CONTENT">
			<Form on:submit={handleAccessKeyForm}>
				<FormFieldset>
					<FormField name="accessKey" label="Access key">
						<FormInput {error} type="password" name="accessKey" bind:value={accessKeyValue} />
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button disabled={!accessKeyValue} appearance={Appearance.ACTIVE}>Continue</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>
</ScrollView>
