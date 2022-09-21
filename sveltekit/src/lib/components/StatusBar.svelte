<script lang="ts">
	import { formatDistance, fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Button from './Button.svelte';
	import Link from './Link.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';

	$: ({ message, appearance, isError, secondaryActions } = $statusBarStore);

	// Set how long ago the vault was updated in the status bar
	const getVaultLastUpdate = async (onMount: boolean = false) => {
		if ($statusBarStore.isError) return;

		// Prevent changing the statusBar when there is another one present
		if (!$statusBarStore.appearance) {
			const data = await api({ endpoint: 'vault' });

			$statusBarStore = {
				message: `Vault data was last updated ${formatDistance(
					fromUnixTime(data.lastDataUpdate),
					new Date(),
					{ includeSeconds: true, addSuffix: true }
				)}`
			};
		}

		// Recursively update status bar message every 5 minutes but only when
		// function is ran from the `onMount` hook
		if (onMount) {
			const FIVE_MINUTES_IN_MILLISECONDS = 300000;
			setTimeout(async () => {
				await getVaultLastUpdate(true);
			}, FIVE_MINUTES_IN_MILLISECONDS);
		}
	};

	// Set the default status bar message when layout is mounted
	onMount(async () => {
		$isVaultReadyStore && (await getVaultLastUpdate(true));
	});

	const dismissStatus = () => {
		$statusBarStore = {
			message: 'Canutin'
		};
		getVaultLastUpdate();
	};

	$: {
		// Auto-dismiss positive alerts after 7 seconds
		if ($statusBarStore.appearance === Appearance.POSITIVE) {
			const SEVEN_SECONDS_IN_MILLISECONDS = 7000;
			setTimeout(async () => {
				dismissStatus();
			}, SEVEN_SECONDS_IN_MILLISECONDS);
		}
	}
</script>

<div class="statusBar {appearance && `statusBar--${appearance}`}">
	<p class="statusBar__p">
		{message}

		{#if secondaryActions}
			{#each secondaryActions as action}
				<Link href={action.href} target={action.target}>{action.label}</Link>
			{/each}
		{/if}
	</p>

	{#if appearance && !isError}
		<Button on:click={dismissStatus}>Dismiss</Button>
	{/if}
</div>

<style lang="scss">
	div.statusBar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		color: var(--color-grey50);

		&--active,
		&--positive,
		&--negative,
		&--warning {
			border-right: 1px solid var(--color-border);
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-blueSecondary);
		}

		&--positive {
			color: var(--color-greenPrimary);
			background-color: var(--color-greenSecondary);

			&:after {
				content: '';
				position: absolute;
				top: -1px;
				left: 0;
				right: 0;
				height: 1px;
				background-color: var(--color-greenPrimary);
				animation: autoDismiss 7s ease-out;
			}

			@keyframes autoDismiss {
				0% {
					right: 100%;
				}
				100% {
					right: 0;
				}
			}
		}

		&--negative {
			color: var(--color-redPrimary);
			background-color: var(--color-redSecondary);
		}

		&--warning {
			color: var(--color-yellowPrimary);
			background-color: var(--color-yellowSecondary);
		}
	}

	p.statusBar__p {
		display: flex;
		column-gap: 8px;
		font-size: 12px;
		margin: 0;
	}
</style>
