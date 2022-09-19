<script lang="ts">
	import { formatDistance, fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Button from './Button.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';

	// Set how long ago the vault was updated in the status bar
	const getVaultLastUpdate = async () => {
		// If there is an error present in the statusBarStore, don't update the message
		if ($statusBarStore.appearance === Appearance.NEGATIVE) return;

		const data = await api({ endpoint: 'vault' });

		$statusBarStore = {
			message: `Vault data was last updated ${formatDistance(
				fromUnixTime(data.lastDataUpdate),
				new Date(),
				{ includeSeconds: true, addSuffix: true }
			)}`,
			appearance: null
		};

		// Recursively update status bar message every 5 minutes
		setTimeout(async () => {
			await getVaultLastUpdate();
		}, 300000);
	};

	// Set the default status bar message when layout is mounted
	onMount(async () => {
		$isVaultReadyStore && (await getVaultLastUpdate());
	});

	$: ({ message, appearance } = $statusBarStore);

	message = message ? message : 'Reading vault data...';
</script>

<div class="statusBar {appearance && `statusBar--${appearance}`}">
	<p class="statusBar__p">
		{message}
	</p>

	{#if appearance && appearance !== Appearance.NEGATIVE}
		<Button on:click={getVaultLastUpdate}>Dismiss</Button>
	{/if}
</div>

<style lang="scss">
	div.statusBar {
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
		&--negative {
			border-right: 1px solid var(--color-border);
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-blueSecondary);
		}

		&--positive {
			color: var(--color-greenPrimary);
			background-color: var(--color-greenSecondary);
		}

		&--negative {
			color: var(--color-redPrimary);
			background-color: var(--color-redSecondary);
		}
	}

	p.statusBar__p {
		font-size: 12px;
		margin: 0;
	}
</style>
