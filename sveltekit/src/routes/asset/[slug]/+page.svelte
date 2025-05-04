<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';

	import Head from '$lib/components/Head.svelte';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AssetForm from '../AssetForm.svelte';
	import ChartBalanceHistory from '$lib/components/ChartBalanceHistory.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import { api } from '$lib/helpers/misc';
	import { UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { CRUDResponse } from '$lib/helpers/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	const title = data.asset.name;
	let asset: CRUDResponse;
	let referrer = '/assets';

	afterNavigate(({ from }) => {
		referrer = from?.url.pathname || referrer;
	});

	const handleSubmit = async (event: any) => {
		let payload: Prisma.AssetUncheckedCreateInput = {
			id: data.asset.id,
			name: event.target.name?.value,
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
		asset = await api({ endpoint: 'asset', method: 'PATCH', payload });

		if (!asset.error) await goto(referrer);
	};

	const handleDelete = async () => {
		const confirmDeletion = window.confirm(
			`${UNDOABLE_ACTION}Are you sure you want to delete the asset?`
		);
		if (!confirmDeletion) return;

		const deletedAsset = await api({
			endpoint: 'asset',
			method: 'DELETE',
			payload: data.asset.id
		});

		if (!deletedAsset.error) await goto(referrer);
	};
</script>

<Head title={[title, 'Asset']} />

<ScrollView {title}>
	<ChartBalanceHistory balanceHistoryDataset={data.balanceHistoryDataset} labels={data.labels} />

	<Section title="Update asset">
		<div slot="CONTENT">
			<AssetForm
				{handleSubmit}
				asset={data.asset}
				selectAssetTypes={data.selectAssetTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				quantifiableAssetTypes={data.quantifiableAssetTypes}
				lastBalanceStatement={data.lastBalanceStatement}
				submitButtonLabel="Save"
			/>
		</div>
	</Section>

	<Section title="Danger zone">
		<div slot="CONTENT">
			<DangerZone {handleDelete}>
				Permanently delete asset <strong>{data.asset.name}</strong>
			</DangerZone>
		</div>
	</Section>
</ScrollView>
