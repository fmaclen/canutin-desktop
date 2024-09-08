<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAssetsContext } from '$lib/assets.svelte';
	import { formatCurrency } from '$lib/utils';

	const assetsStore = getAssetsContext();
</script>

<h1>{$LL.ASSETS()}</h1>

<table>
	<thead>
		<tr>
			<th>{$LL.NAME()}</th>
			<th>{$LL.BALANCE()}</th>
		</tr>
	</thead>
	<tbody>
		{#each assetsStore.assets as asset}
			<tr>
				<td>{asset.name}</td>
				<td>{formatCurrency(asset.balance ?? 0)}</td>
			</tr>
		{/each}
	</tbody>
</table>
