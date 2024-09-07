<script lang="ts">
	import { getAssetsContext } from '$lib/assets.svelte';
	import { formatCurrency } from '$lib/utils';

	const assetsStore = getAssetsContext();
</script>

<h1>Assets</h1>

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Balance</th>
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
