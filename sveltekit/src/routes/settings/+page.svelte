<script lang="ts">
	import { onMount } from 'svelte';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import FormNoticeNotice from '$lib/components/FormNoticeNotice.svelte';
	import FormNoticeP from '$lib/components/FormNoticeP.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import { SyncSettings, Appearance, EventFrequency } from '$lib/helpers/constants';
	import type { ImportSync } from '$lib/helpers/import';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';

	const title = 'Settings';

	let isLoading: boolean = false;

	export let data: PageData;
	$: ({ settings } = data);

	$: isSyncEnabled = false;
	$: canutinFileUrlValue = '';
	$: frequencyValue = 0;
	$: cookieValue = '';
	$: jwtValue = '';

	const setLoadingStatus = (message: string) => {
		isLoading = true;
		$statusBarStore = {
			message,
			appearance: Appearance.ACTIVE
		};
	};

	const setResultStatus = (message: string, appearance: Appearance) => {
		isLoading = false;
		$statusBarStore = {
			message,
			appearance
		};
	};

	const handleSyncForm = async (event: any) => {
		const canutinFileUrl = event.target.canutinFileUrl?.value;
		const frequency = event.target.frequency?.value;
		const cookie = event.target.cookie?.value;
		const jwt = event.target.jwt?.value;

		if (!canutinFileUrl) return;

		const payload: ImportSync = {
			canutinFileUrl,
			frequency,
			cookie,
			jwt
		};

		!isSyncEnabled && setLoadingStatus('Checking the CanutinFile URL...');

		const response = await api({
			endpoint: 'sync',
			method: 'POST',
			payload: payload
		});

		// Update the status bar
		setResultStatus(
			response?.error
				? response?.error
				: response?.warning
				? response.warning
				: 'Sync was enabled succesfully',
			response?.error
				? Appearance.NEGATIVE
				: response?.warning
				? Appearance.WARNING
				: Appearance.POSITIVE
		);

		isSyncEnabled = response.isSyncEnabled;
	};

	const frequencyOptions = Object.values(EventFrequency).map((value) => ({
		label: value
	}));

	onMount(async () => {
		settings.forEach((setting) => {
			if (!setting) return;
			switch (setting.name) {
				case SyncSettings.SYNC_ENABLED:
					isSyncEnabled = setting.value === '1' ? true : false;
					break;
				case SyncSettings.SYNC_URL:
					canutinFileUrlValue = setting.value;
					break;
				case SyncSettings.SYNC_FREQUENCY:
					frequencyValue = parseInt(setting.value);
					break;
				case SyncSettings.SYNC_COOKIE:
					cookieValue = setting.value;
					break;
				case SyncSettings.SYNC_JWT:
					jwtValue = setting.value;
					break;
			}
		});
	});
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Sync">
		<div slot="CONTENT" class="import">
			<Form on:submit={handleSyncForm}>
				<FormFieldset>
					<FormField name="status" label="Sync status">
						<FormNotice>
							<FormNoticeNotice
								appearance={isSyncEnabled ? Appearance.POSITIVE : Appearance.WARNING}
							>
								<FormNoticeP>
									<strong>Sync is {isSyncEnabled ? 'enabled' : 'disabled'}</strong>
								</FormNoticeP>
								{#if !isSyncEnabled}
									<FormNoticeP>
										Enable syncing by providing a URL that can be fetched as a CanutinFile JSON
										payload. On every sync the vault will be updated with any new data found,
										duplicates will be ignored.
									</FormNoticeP>
								{/if}
							</FormNoticeNotice>
						</FormNotice>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="canutinFileUrl" label="CanutinFile URL">
						<FormInput
							name="canutinFileUrl"
							placeholder="https://example.com/my-scraper/canutinFile.json"
							bind:value={canutinFileUrlValue}
						/>
					</FormField>
					<FormField name="cookie" label="Cookie" optional={true}>
						<FormInput
							required={false}
							name="cookie"
							type="password"
							placeholder="accessToken=1234abc; userId=1234; Path=/; HttpOnly;"
							value={cookieValue}
						/>
					</FormField>
					<FormField name="jwt" label="JSON Web Token" optional={true}>
						<FormInput type="password" required={false} name="jwt" value={jwtValue} />
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="frequency" label="Auto-sync">
						<FormSelect
							name="frequency"
							options={frequencyOptions}
							bind:value={frequencyValue}
							disabled={true}
						/>
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE} disabled={!canutinFileUrlValue}>
						{isSyncEnabled ? 'Update' : 'Enable'}
					</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.database {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
	}

	nav.nav {
		display: flex;
		flex-direction: row;
		column-gap: 12px;
		border: 1px solid var(--color-border);
		border-radius: 4px;
		display: flex;
		padding: 12px;
	}
</style>
