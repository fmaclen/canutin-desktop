<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import { getAssetsContext } from '$lib/assets.svelte';
	import Currency from '$lib/components/Currency.svelte';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Number from '$lib/components/Number.svelte';
	import Section from '$lib/components/Section.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';

	const assetsStore = getAssetsContext();
</script>

<Head title={$LL.ASSETS()} />

<MainHeader>
	<H1>{$LL.ASSETS()}</H1>
</MainHeader>

<Section>
	{#if !assetsStore.assets.length}
		<Notice>{$LL.NO_ASSETS_FOUND()}</Notice>
	{:else}
		<table class="text-sm">
			<thead>
				<tr class="text-left">
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
						<td><Number value={asset.quantity} /></td>
						<td><Currency value={asset.cost} currency="USD" locale="en-US" /></td>
						<td><Currency value={asset.balance} currency="USD" locale="en-US" /></td>
						<td><Timestamp date={new Date(asset.updated)} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Section>
