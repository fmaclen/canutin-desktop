<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import { format } from 'date-fns';

	import { getAssetsContext } from '$lib/assets.svelte';
	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
	import Notice from '$lib/components/Notice.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatCurrency } from '$lib/utils';
	import Number from '$lib/components/Number.svelte';

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
						<td><Number>{asset.symbol ?? '~'}</Number></td>
						<td><Number>{asset.quantity ?? 0}</Number></td>
						<td><Number>{formatCurrency(asset.cost ?? 0)}</Number></td>
						<td><Number>{formatCurrency(asset.balance ?? 0)}</Number></td>
						<td><Number>{format(asset.updated, 'MMM d, yyyy')}</Number></td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</Section>
