<script lang="ts">
	import semver from 'semver';
	import { getUnixTime } from 'date-fns';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';

	import StatusBar from '$lib/components/StatusBar.svelte';
	import ButtonTag from '$lib/components/ButtonTag.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import lastUpdateCheckStore from '$lib/stores/lastUpdateCheckStore';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import isAppReadyStore from '$lib/stores/isAppReadyStore';
	import { Appearance } from '$lib/helpers/constants';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';

	export let data: PageData;
	$: disabledLink = !$isAppReadyStore && 'layout__a--disabled'; // Disabled links
	$: pathname = $page.url.pathname;

	const getAppLastestVersion = async (isUserRequested: boolean = false) => {
		// Don't check for updates if the app is in an error state
		if ($statusBarStore.isError) return;

		const THREE_DAYS_IN_SECONDS = 259200;
		const currentTime = getUnixTime(new Date());
		const threeDaysAgoInSeconds = getUnixTime(new Date()) - THREE_DAYS_IN_SECONDS;

		// Set it to 3 days ago to trigger an update check under these conditions
		if (!$lastUpdateCheckStore || isUserRequested) {
			$lastUpdateCheckStore = threeDaysAgoInSeconds - 1;
		}

		// Check if `$lastUpdateCheckStore` is at least 3 days old
		if ($lastUpdateCheckStore < threeDaysAgoInSeconds) {
			try {
				// Get the latest version from GitHub
				const response = await (
					await fetch('https://api.github.com/repos/canutin/desktop/releases')
				).json();
				const latestVersion = response[0]?.tag_name?.replace('v', '');

				// Update status bar with latest version
				if (latestVersion && semver.lt(data.appVersion, latestVersion)) {
					$statusBarStore = {
						message: `A newer version is available (${latestVersion})`,
						appearance: Appearance.ACTIVE,
						secondaryActions: [
							{
								label: 'Download',
								href: 'https://github.com/canutin/desktop/releases',
								target: '_blank'
							}
						]
					};
				} else {
					if (isUserRequested) {
						$statusBarStore = {
							message: `The current version is the latest (${data.appVersion})`,
							appearance: Appearance.POSITIVE
						};
					}
				}
			} catch (_e) {
				if (isUserRequested) {
					$statusBarStore = {
						message: `There was a problem checking for updates, try again later`,
						appearance: Appearance.WARNING
					};
				}
			}
			$lastUpdateCheckStore = currentTime; // Set the last updated date
		}

		// Recursively check for updates every 3 days
		!isUserRequested &&
			setTimeout(async () => {
				await getAppLastestVersion();
			}, THREE_DAYS_IN_SECONDS * 1000);
	};

	// Try to sync the vault with a server that returns a CanutinFile
	$syncStatusStore = data?.syncStatus || $syncStatusStore;
	$: isSyncSetup = $syncStatusStore.isSyncSetup;
	$: isSyncEnabled = $syncStatusStore.isSyncEnabled;
	$: isSyncing = false;

	const sync = async () => {
		isSyncing = true;
		$statusBarStore = {
			message: 'Syncing...',
			appearance: Appearance.ACTIVE
		};

		const response = await api({ endpoint: 'sync' });
		$syncStatusStore = response?.syncStatus || $syncStatusStore;

		if (response.warning) {
			$statusBarStore = {
				message: response.warning,
				appearance: Appearance.WARNING
			};
		} else {
			const accountsCreatedOrUpdated =
				response?.importedAccounts?.created?.length + response?.importedAccounts?.updated?.length;
			const assetsCreatedOrUpdated =
				response?.importedAssets?.created?.length + response?.importedAssets?.updated?.length;

			$statusBarStore = {
				message: `Sync updated ${accountsCreatedOrUpdated} accounts and ${assetsCreatedOrUpdated} assets`,
				appearance: Appearance.POSITIVE
			};
		}
		isSyncing = false;
	};

	$: calendar = refreshCalendar();

	const refreshCalendar = () => {
		return `${new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		})} · ${new Date().toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric',
			hour12: true
		})}`;
	};

	// Set the default status bar message when layout is mounted
	onMount(async () => {
		// `!dev` because we don't want to constantly hit Github's API when developing
		!dev && (await getAppLastestVersion());

		setInterval(() => {
			calendar = refreshCalendar();
		}, 1000);
	});
</script>

<div class="layout">
	<a class="layout__logo" href="/">
		<img class="layout__img" src={logo} alt="Canutin logo" />
	</a>
	<div class="layout__title-bar">{calendar}</div>

	<aside class="layout__aside">
		<nav class="layout__nav">
			<a
				href="/"
				class="layout__a
					{pathname === '/' && 'layout__a--active'}
					{disabledLink}
				"
			>
				The big picture
			</a>
			<a
				href="/balanceSheet"
				class="layout__a
					{pathname === '/balanceSheet' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Balance sheet
			</a>
			<a
				href="/trends"
				class="layout__a
					{pathname === '/trends' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Trends
			</a>
			<hr class="layout__hr" />
			<a
				href="/assets"
				class="layout__a
					{pathname === '/assets' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Assets
			</a>
			<a
				href="/accounts"
				class="layout__a
					{pathname === '/accounts' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Accounts
			</a>
			<a
				href="/transactions"
				class="layout__a
					{pathname === '/transactions' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Transactions
			</a>
		</nav>

		<nav class="layout__nav layout__nav--secondary">
			{#if dev}
				<a
					href="/devTools"
					class="layout__a
						{pathname === '/devTools' && 'layout__a--active'}
						{disabledLink}
					"
				>
					Developer tools
				</a>
			{/if}
			<a
				href="/settings"
				class="layout__a
					{pathname === '/settings' && 'layout__a--active'}
					{disabledLink}
				"
			>
				Settings
			</a>
			{#if isSyncSetup}
				<a
					href="/data"
					class="layout__a
						{pathname === '/data' && 'layout__a--active'}
						{disabledLink}
					"
				>
					Add or update data
				</a>
			{/if}
		</nav>

		<nav class="layout__nav layout__nav--primary">
			{#if isSyncSetup}
				<button
					on:click={() => sync()}
					disabled={!isSyncEnabled || isSyncing || !$isAppReadyStore}
					class="layout__button layout__button--primary"
				>
					Sync
				</button>
			{:else}
				<a
					href="/data"
					class="layout__a layout__a--primary
						{pathname === '/data' && 'layout__a--active'}
						{disabledLink}
					"
				>
					Add or update data
				</a>
			{/if}
		</nav>
	</aside>

	<slot />

	<footer class="layout__footer">
		<StatusBar />
		<div class="layout__settings">
			<ButtonTag disabled={true}>USD $</ButtonTag>
			<ButtonTag disabled={true}>English</ButtonTag>
			<ButtonTag on:click={() => getAppLastestVersion(true)}>
				{data.appVersion}
			</ButtonTag>
		</div>
	</footer>
</div>

<style lang="scss">
	div.layout {
		display: grid;
		grid-template-rows: 48px auto 48px;
		grid-template-columns: 240px auto;
		grid-template-areas:
			'logo title-bar'
			'side-bar body'
			'side-bar status-bar';
		height: 100vh;
		overflow-y: hidden;
	}

	div.layout__title-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: var(--color-grey30);
		background-color: var(--color-white);
		border-bottom: 1px solid var(--color-border);
		padding: 0 16px;
		text-align: right;
		font-family: var(--font-monospace);
		text-transform: uppercase;
		transition: color 0.2s ease-in-out;

		grid-area: title-bar;

		&:hover {
			color: var(--color-grey80);
		}
	}

	a.layout__logo {
		display: flex;
		align-items: center;
		width: 240px;
		height: 100%;
		padding-left: 32px;
		padding-right: 32px;
		box-sizing: border-box;
		border-right: 1px solid;
		border-bottom: 1px solid;
		border-color: var(--color-border);
		background-color: var(--color-white);

		grid-area: logo;

		&:hover {
			background-color: var(--color-grey3);
		}
	}

	aside.layout__aside {
		display: flex;
		flex-direction: column;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);
		height: 100%;
		box-sizing: border-box;

		grid-area: side-bar;
	}

	img.layout__img {
		width: 20px;
	}

	nav.layout__nav {
		display: flex;
		flex-direction: column;

		&:first-child {
			padding-top: 16px;
		}

		&--secondary {
			margin-top: auto;
			padding-bottom: 16px;
		}
	}

	button.layout__button,
	a.layout__a {
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		color: var(--color-grey80);
		padding: 16px 32px;

		&:hover {
			background-color: var(--color-grey3);
		}

		&--active:not(.layout__a--disabled) {
			color: var(--color-bluePrimary);
		}

		&--primary {
			height: 48px;
			box-sizing: border-box;
			border-top: 1px solid var(--color-border);
		}
	}

	button.layout__button:disabled,
	a.layout__a--disabled {
		pointer-events: none;
		color: var(--color-grey20);
	}

	hr.layout__hr {
		border: none;
		border-top: 1px solid var(--color-border);
		margin: 16px 0;
	}

	button.layout__button {
		border-left: none;
		border-right: none;
		border-bottom: none;
		background-color: transparent;
		text-align: left;
		cursor: pointer;
	}

	footer.layout__footer {
		position: sticky;
		bottom: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: var(--color-white);
		border-top: 1px solid var(--color-border);
		width: 100%;

		grid-area: status-bar;
	}

	div.layout__settings {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 16px;
		column-gap: 4px;
	}
</style>
