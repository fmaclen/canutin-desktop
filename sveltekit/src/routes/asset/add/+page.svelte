<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AssetForm from '../AssetForm.svelte';
	import { api } from '$lib/helpers/misc';
	import type { PageData } from './$types';
	import type { CRUDResponse } from '$lib/helpers/forms';

	export let data: PageData;
	let asset: CRUDResponse;
	let referrer = '/assets';

	afterNavigate(({ from }) => {
		// Redirect to `/assets` if the referrer came from the "Add or update data" page
		const { pathname } = from?.url || {};
		referrer = pathname && pathname !== '/data' ? pathname : referrer;
	});

	const handleSubmit = async (event: any) => {
		const payload: Prisma.AssetUncheckedCreateInput = {
			name: event.target.name?.value,
			symbol: event.target.symbol?.value,
			balanceGroup: parseInt(event.target.balanceGroup?.value),
			assetTypeId: parseInt(event.target.assetTypeId?.value),
			isSold: event.target.isSold?.checked ? true : false,
			isExcludedFromNetWorth: event.target.isExcludedFromNetWorth?.checked ? true : false,
			assetBalanceStatements: {
				create: [
					{
						quantity: parseFloat(event.target.quantity?.value),
						cost: parseFloat(event.target.cost?.value),
						value: parseFloat(event.target.value?.value)
					}
				]
			}
		};
		asset = await api({ endpoint: 'asset', method: 'POST', payload });

		if (!asset.error) await goto(referrer);
	};

	const title = 'Add asset';
</script>

<Head {title} />

<ScrollView {title}>
	<Section title="New asset">
		<div slot="CONTENT">
			<AssetForm
				{handleSubmit}
				selectAssetTypes={data.selectAssetTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				quantifiableAssetTypes={data.quantifiableAssetTypes}
				submitButtonLabel="Add"
			/>
		</div>
	</Section>
</ScrollView>
