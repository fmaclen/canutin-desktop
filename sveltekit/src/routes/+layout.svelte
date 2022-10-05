<script lang="ts">
	import semver from 'semver';
	import { getUnixTime } from 'date-fns';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { dev } from '$app/environment';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';

	import StatusBar from '$lib/components/StatusBar.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import lastUpdateCheckStore from '$lib/stores/lastUpdateCheckStore';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import { api } from '$lib/helpers/misc';

	export let data: PageData;
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

	// Set the default status bar message when layout is mounted
	onMount(async () => {
		// `!dev` because we don't want to constantly hit Github's API when developing
		!dev && (await getAppLastestVersion());
	});
</script>

<div class="layout">
	<aside class="layout__aside">
		<a class="layout__logo" href="/">
			<img class="layout__img" src={logo} alt="Canutin logo" />
		</a>
		<nav class="layout__nav">
			<a
				class="layout__a {pathname === '/' && 'layout__a--active'} {!$isVaultReadyStore &&
					'layout__a--disabled'}"
				href="/"
				>The big picture
			</a>
			<a
				class="layout__a {pathname === '/balanceSheet' &&
					'layout__a--active'} {!$isVaultReadyStore && 'layout__a--disabled'}"
				href="/balanceSheet"
				>Balance sheet
			</a>
			<a
				class="layout__a {pathname === '/transactions' &&
					'layout__a--active'} {!$isVaultReadyStore && 'layout__a--disabled'}"
				href="/transactions"
				>Transactions
			</a>
		</nav>

		<nav class="layout__nav layout__nav--bottom">
			<nav class="layout__nav">
				{#if dev}
					<a
						class="layout__a {!$isVaultReadyStore && 'layout__a--disabled'} {pathname ===
							'/devTools' && 'layout__a--active'}"
						href="/devTools"
						>Developer tools
					</a>
				{/if}
				<a class="layout__a {pathname === '/settings' && 'layout__a--active'}" href="/settings"
					>Settings
				</a>
				{#if isSyncSetup}
					<a class="layout__a {pathname === '/data' && 'layout__a--active'}" href="/data"
						>Add or update data
					</a>
				{/if}
			</nav>

			{#if !isSyncSetup}
				<a
					class="layout__a layout__a--primary {pathname === '/data' && 'layout__a--active'}"
					href="/data"
					>Add or update data
				</a>
			{/if}

			{#if isSyncSetup}
				<button
					class="layout__a layout__a--primary {!$isVaultReadyStore && 'layout__a--disabled'}"
					on:click={() => sync()}
					disabled={!isSyncEnabled || isSyncing}
					>Sync
				</button>
			{/if}
		</nav>
	</aside>

	<slot />

	<footer class="layout__footer">
		<StatusBar />
		<div class="layout__settings">
			<p class="layout__tag">USD $</p>
			<p class="layout__tag">English</p>
			<button class="layout__tag" type="button" on:click={() => getAppLastestVersion(true)}>
				{data.appVersion}
			</button>
		</div>
	</footer>
</div>

<style lang="scss">
	div.layout {
		display: grid;
		grid-template-rows: auto 48px;
		grid-template-columns: 240px auto;
		grid-template-areas:
			'side-bar body'
			'side-bar status-bar';
		height: 100vh;
		overflow-y: hidden;
	}

	aside.layout__aside {
		display: flex;
		flex-direction: column;
		row-gap: 16px;
		background-color: var(--color-white);
		border-right: 1px solid var(--color-border);
		height: 100%;

		grid-area: side-bar;
	}

	a.layout__logo {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 48px;
		border-bottom: 1px solid var(--color-border);

		&:hover {
			background-color: var(--color-grey3);
		}
	}

	img.layout__img {
		width: 48px;
	}

	nav.layout__nav {
		display: flex;
		flex-direction: column;

		&--bottom {
			margin-top: auto;
			row-gap: 16px;
		}
	}

	button.layout__a,
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

		&:disabled,
		&--disabled {
			pointer-events: none;
			color: var(--color-grey20);
		}

		&--primary {
			height: 48px;
			box-sizing: border-box;
			border-top: 1px solid var(--color-border);
		}
	}

	// FIXME: should be called `button.layout__button`, maybe
	button.layout__a {
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

	button.layout__tag,
	p.layout__tag {
		font-family: var(--font-monospace);
		font-weight: 400;
		text-transform: uppercase;
		font-size: 11px;
		letter-spacing: -0.025em;
		color: var(--color-grey50);
		background-color: var(--color-grey7);
		padding: 6px 8px;
		border-radius: 4px;
		width: max-content;
	}

	button.layout__tag {
		border: none;
		cursor: pointer;

		&:hover {
			color: var(--color-grey70);
		}
	}
</style>
