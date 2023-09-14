<script lang="ts">
	import { formatDistance, fromUnixTime } from 'date-fns';
	import { onMount } from 'svelte';

	import isAppReadyStore from '$lib/stores/isAppReadyStore';
	import { api } from '$lib/helpers/misc';

	let statusMessage: string = 'Canutin';

	// Set how long ago the vault was updated in the status bar
	const getVaultLastUpdate = async (onMount: boolean = false) => {
		const response = await api({ endpoint: 'vault' });

		if (response) {
			statusMessage = `Vault data was last updated ${formatDistance(
				fromUnixTime(response.lastDataUpdate),
				new Date(),
				{ includeSeconds: true, addSuffix: true }
			)}`;
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
		if ($isAppReadyStore) await getVaultLastUpdate(true);
	});
</script>

<div class="statusBar">
	<p class="statusBar__p">{statusMessage}</p>
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
		color: var(--color-neutral-500);
	}

	p.statusBar__p {
		display: flex;
		column-gap: 8px;
		font-size: 12px;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
