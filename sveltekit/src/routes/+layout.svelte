<script lang="ts">
	import semver from 'semver';
	import { getUnixTime } from 'date-fns';
	import { onMount } from 'svelte';
	import { navigating, page } from '$app/stores';
	import { dev } from '$app/environment';

	import logo from '$lib/assets/canutin-iso-logo.svg';
	import '../app.scss';

	import StatusBar from '$lib/components/StatusBar.svelte';
	import ButtonTag from '$lib/components/ButtonTag.svelte';
	import FlashAlert from '$lib/components/FlashAlert.svelte';

	import lastUpdateCheckStore from '$lib/stores/lastUpdateCheckStore';
	import syncStatusStore from '$lib/stores/syncStatusStore';
	import isAppReadyStore from '$lib/stores/isAppReadyStore';
	import colorThemeStore from '$lib/stores/colorThemeStore';
	import { api } from '$lib/helpers/misc';
	import { toast } from '@zerodevx/svelte-toast';
	import { setColorTheme } from '$lib/components/FlashAlert';
	import { Appearance, ColorTheme } from '$lib/helpers/constants';
	import type { PageData } from './$types';

	export let data: PageData;
	$: disabledLink = !$isAppReadyStore && 'layout__a--disabled'; // Disabled links
	$: pathname = $page.url.pathname;

	let isNavigating: boolean = true;
	navigating.subscribe((value) => (isNavigating = value !== null));

	const getAppLastestVersion = async (isUserRequested: boolean = false) => {
		const GITHUB_RELEASES_API = 'https://api.github.com/repos/canutin/desktop/releases';
		const GITHUB_RELEASES_URL = 'https://github.com/canutin/desktop/releases';
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
				const response = await (await fetch(GITHUB_RELEASES_API)).json();
				const latestVersion = response[0]?.tag_name?.replace('v', '');

				// Update status bar with latest version
				if (latestVersion && data.appVersion && semver.lt(data.appVersion, latestVersion)) {
					toast.push(
						`A newer version is available. <a class="toastLink" href="${GITHUB_RELEASES_URL}" target="_blank">Download ${latestVersion}</a>`,
						{
							initial: 0,
							reversed: true,
							...setColorTheme(Appearance.ACTIVE)
						}
					);
				} else {
					if (isUserRequested) {
						toast.push(`The current version is the latest (${data.appVersion})`, {
							initial: 1,
							duration: 5000,
							reversed: true,
							...setColorTheme(Appearance.POSITIVE)
						});
					}
				}
			} catch (_e) {
				if (isUserRequested) {
					toast.push('There was a problem checking for updates, try again later', {
						initial: 1,
						duration: 5000,
						reversed: true,
						...setColorTheme(Appearance.NEGATIVE)
					});
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
		const response = await api({ endpoint: 'sync' });
		$syncStatusStore = response?.syncStatus || $syncStatusStore;
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

	const setGlobalColorTheme = () => {
		// NOTE: there is code duplication in `app.html` to avoid flash of unstyled content
		const colorTheme: ColorTheme =
			($colorThemeStore as ColorTheme) ||
			(window?.matchMedia('(prefers-color-scheme: dark)').matches
				? ColorTheme.DARK
				: ColorTheme.LIGHT);

		document.documentElement.setAttribute('data-color-theme', colorTheme);
	};

	$: $colorThemeStore && setGlobalColorTheme();

	// Set the default status bar message when layout is mounted
	onMount(async () => {
		// `!dev` because we don't want to constantly hit Github's API when developing
		!dev && (await getAppLastestVersion());

		setInterval(() => {
			calendar = refreshCalendar();
		}, 1000);
	});
</script>

<FlashAlert />

<div class="layout {isNavigating && 'layout--is-navigating'}">
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

		// HACK:
		// We are overriding the styles every link and button with a "busy" cursor
		// to signify the app is navigating between pages.
		// Ideally at some point we can rely on the browser's native way of signaling
		// that the server is busy.
		&--is-navigating,
		&--is-navigating :global(a),
		&--is-navigating :global(button) {
			cursor: wait !important; // Ugh...
		}
	}

	div.layout__title-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: var(--color-neutral-300);
		background-color: var(--color-neutral-0);
		border-bottom: 1px solid var(--color-border);
		padding: 0 16px;
		text-align: right;
		font-family: var(--font-monospace);
		text-transform: uppercase;

		grid-area: title-bar;

		&:hover {
			color: var(--color-neutral-800);
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
		background-color: var(--color-neutral-0);

		grid-area: logo;

		&:hover {
			background-color: var(--color-neutral-30);
		}
	}

	aside.layout__aside {
		display: flex;
		flex-direction: column;
		background-color: var(--color-neutral-0);
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
		color: var(--color-neutral-800);
		padding: 16px 32px;

		&:hover {
			background-color: var(--color-neutral-30);
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
		color: var(--color-neutral-200);
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
		background-color: var(--color-neutral-0);
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
