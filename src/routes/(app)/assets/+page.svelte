<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { format } from 'date-fns';

	import { getAssetsContext } from '$lib/assets.svelte';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import { formatCurrency } from '$lib/utils';

	const assetsStore = getAssetsContext();
</script>

<Head title={$LL.ASSETS()} />

<MainHeader>
	<H1>{$LL.ASSETS()}</H1>
</MainHeader>

{#if !assetsStore.assets.length}
	<p>{$LL.NO_ASSETS_FOUND()}</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>{$LL.NAME()}</th>
				<th>{$LL.ASSET_TYPE()}</th>
				<th>{$LL.SYMBOL()}</th>
				<th>{$LL.QUANTITY()}</th>
				<th>{$LL.COST()}</th>
				<th>{$LL.VALUE()}</th>
				<th>{$LL.LAST_UPDATED()}</th>
			</tr>
		</thead>
		<tbody>
			{#each assetsStore.assets as asset}
				<tr>
					<td>{asset.name}</td>
					<td>{asset.expand.tag.name}</td>
					<td>{asset.symbol ? asset.symbol : '~'}</td>
					<td>{asset.quantity ? asset.quantity : '~'}</td>
					<td>{asset.cost ? formatCurrency(asset.cost) : '~'}</td>
					<td>{formatCurrency(asset.balance ?? 0)}</td>
					<td>{format(asset.updated, 'MMM d, yyyy')}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
