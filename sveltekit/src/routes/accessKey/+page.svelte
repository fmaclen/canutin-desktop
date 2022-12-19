<script lang="ts">
	import { goto } from '$app/navigation';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import isAppReadyStore from '$lib/stores/isAppReadyStore';
	import Form from '$lib/components/Form.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import { Appearance } from '$lib/helpers/constants';
	import { getAccessKeyCookie } from '$lib/helpers/accessKey';
	import { api } from '$lib/helpers/misc';
	import { onMount } from 'svelte';

	const title = 'Access key';

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

			document.cookie = getAccessKeyCookie(response.accessKey);
			$isAppReadyStore = true;
			await goto('/');
		} catch (e) {
			error = 'Incorrect access key';
		}
	};

	onMount(async () => {
		document.cookie = getAccessKeyCookie('', 0); // Resets existing cookie
	});
</script>

<Head {title} />

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
