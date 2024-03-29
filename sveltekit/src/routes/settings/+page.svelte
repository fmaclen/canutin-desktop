<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import Button from '$lib/components/Button.svelte';
	import Form from '$lib/components/Form.svelte';
	import FormFieldset from '$lib/components/FormFieldset.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import FormInput from '$lib/components/FormInput.svelte';
	import FormFooter from '$lib/components/FormFooter.svelte';
	import FormNotice from '$lib/components/FormNotice.svelte';
	import FormNoticeNotice from '$lib/components/FormNoticeNotice.svelte';
	import FormNoticeP from '$lib/components/FormNoticeP.svelte';
	import FormSelect from '$lib/components/FormSelect.svelte';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import colorThemeStore from '$lib/stores/colorThemeStore';
	import { SyncSettings, Appearance, EventFrequency, ColorTheme } from '$lib/helpers/constants';
	import type { ImportSync } from '$lib/helpers/import';
	import { getAccessKeyCookie } from '$lib/helpers/accessKey';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';

	const title = 'Settings';

	export let data: PageData;
	$: ({ syncStatus, syncSettings, accessKey } = data);

	// Acess key
	let accessKeyValue = '';
	$: isAccessKeyEnabled = false;

	const handleAccessKeyForm = async (event: any) => {
		try {
			const response = await api({
				endpoint: 'accessKey',
				method: 'PATCH',
				payload: event?.target?.accessKey?.value
			});

			document.cookie = getAccessKeyCookie(response.accessKey);
			isAccessKeyEnabled = true;
		} catch (e) {
			await goto('/accessKey');
		}
	};

	const handleAccessKeyReset = async () => {
		const confirmDeletion = window.confirm('Are you sure you want to reset the access key?');
		if (!confirmDeletion) return;

		const response = await api({
			endpoint: 'accessKey',
			method: 'DELETE'
		});

		if (response.accessKey === null) {
			document.cookie = getAccessKeyCookie('', 0); // Resets existing cookie
			accessKeyValue = '';
			isAccessKeyEnabled = false;
		}
	};

	// Sync
	let isSyncLoading: boolean = false;
	$syncStatusStore = syncStatus || $syncStatusStore;
	$: isSyncEnabled = $syncStatusStore.isSyncEnabled;
	$: canutinFileUrlValue = '';
	$: frequencyValue = 0;
	$: cookieValue = '';
	$: jwtValue = '';

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

		isSyncLoading = true;

		const response = await api({
			endpoint: 'sync',
			method: 'POST',
			payload: payload
		});

		// Update the status bar
		$syncStatusStore = response?.syncStatus || $syncStatusStore;
		isSyncLoading = false;
	};

	const frequencyOptions = Object.values(EventFrequency).map((value) => ({
		label: value
	}));

	// Color theming
	let colorThemeValue: ColorTheme;
	const colorThemeOptions = Object.values(ColorTheme).map((value) => ({
		label: value,
		value
	}));

	const handleColorTheme = (event: any): void => {
		$colorThemeStore = event.target.colorTheme.value;
	};

	onMount(async () => {
		accessKeyValue = accessKey ? accessKey : '';
		isAccessKeyEnabled = accessKey !== undefined;

		syncSettings.forEach((setting) => {
			if (!setting) return;
			switch (setting.name) {
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

		colorThemeValue =
			($colorThemeStore as ColorTheme) ||
			(window?.matchMedia('(prefers-color-scheme: dark)').matches
				? ColorTheme.DARK
				: ColorTheme.LIGHT);
	});
</script>

<Head {title} />

<ScrollView {title}>
	<Section title="Access key">
		<div slot="CONTENT" data-test-id="settings-accessKey-form">
			<Form on:submit={handleAccessKeyForm}>
				<FormFieldset>
					<FormField name="status" label="Status">
						<FormNotice>
							<FormNoticeNotice
								appearance={isAccessKeyEnabled ? Appearance.POSITIVE : Appearance.WARNING}
							>
								<FormNoticeP>
									<strong>Access key is {isAccessKeyEnabled ? 'enabled' : 'disabled'}</strong>
								</FormNoticeP>
								<FormNoticeP>
									Setting an access key will prevent unauthorized access to the vault data through
									the web interface or API endpoints.
								</FormNoticeP>
								<FormNoticeP>
									This action does not encrypt the vault data or the data in transit.
								</FormNoticeP>
							</FormNoticeNotice>
						</FormNotice>
					</FormField>
				</FormFieldset>
				<FormFieldset>
					<FormField name="accessKey" label="Key">
						<div class="accessKeyGenerateField">
							<FormInput type="password" name="accessKey" bind:value={accessKeyValue} />
							{#if accessKeyValue}
								<Button
									type="button"
									on:click={() => navigator.clipboard.writeText(accessKeyValue)}
								>
									Copy
								</Button>
							{:else}
								<Button type="button" on:click={() => (accessKeyValue = crypto.randomUUID())}>
									Generate
								</Button>
							{/if}
						</div>
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button disabled={!isAccessKeyEnabled} on:click={handleAccessKeyReset} type="button">
						Reset
					</Button>
					<Button
						disabled={!accessKeyValue}
						appearance={isAccessKeyEnabled ? undefined : Appearance.ACTIVE}
					>
						{isAccessKeyEnabled ? 'Update' : 'Enable'}
					</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>

	<Section title="Sync">
		<div slot="CONTENT" data-test-id="settings-sync-form">
			<Form on:submit={handleSyncForm}>
				<FormFieldset>
					<FormField name="status" label="Status">
						<FormNotice>
							<FormNoticeNotice
								appearance={isSyncEnabled ? Appearance.POSITIVE : Appearance.WARNING}
							>
								<FormNoticeP>
									<strong>Sync is {isSyncEnabled ? 'enabled' : 'disabled'}</strong>
								</FormNoticeP>
								<FormNoticeP>
									Syncing allows data to be fetched as a CanutinFile JSON payload from an external
									server.
								</FormNoticeP>
								<FormNoticeP>
									On every sync the vault will be updated with any new data found, duplicates will
									be ignored.
								</FormNoticeP>
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
					<Button
						disabled={!canutinFileUrlValue || isSyncLoading}
						appearance={isSyncEnabled ? undefined : Appearance.ACTIVE}
					>
						{isSyncEnabled ? 'Update' : 'Enable'}
					</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>

	<Section title="Interface">
		<div slot="CONTENT">
			<Form on:submit={handleColorTheme}>
				<FormFieldset>
					<FormField name="colorTheme" label="Color theme">
						<FormSelect
							name="colorTheme"
							options={colorThemeOptions}
							bind:value={colorThemeValue}
						/>
					</FormField>
				</FormFieldset>
				<FormFooter>
					<Button appearance={Appearance.ACTIVE}>Apply</Button>
				</FormFooter>
			</Form>
		</div>
	</Section>
</ScrollView>

<style lang="scss">
	div.accessKeyGenerateField {
		display: grid;
		grid-template-columns: auto max-content;
		column-gap: 8px;
	}
</style>
