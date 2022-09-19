<script lang="ts">
	import { formatDistance, fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import Button from './Button.svelte';
	import Link from './Link.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import isVaultReadyStore from '$lib/stores/isVaultReadyStore';
	import { api } from '$lib/helpers/misc';

	// Set how long ago the vault was updated in the status bar
	const getVaultLastUpdate = async () => {
		if ($statusBarStore.isError) return;

		const data = await api({ endpoint: 'vault' });

		$statusBarStore = {
			message: `Vault data was last updated ${formatDistance(
				fromUnixTime(data.lastDataUpdate),
				new Date(),
				{ includeSeconds: true, addSuffix: true }
			)}`
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

	$: ({ message, appearance, isError, secondaryActions } = $statusBarStore);

	message = message ? message : 'Reading vault data...';
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
