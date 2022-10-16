<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AssetForm from '../AssetForm.svelte';
	import DangerZone from '$lib/components/DangerZone.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance, UNDOABLE_ACTION } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { AddOrUpdateAPIResponse } from '$lib/helpers/forms';

	export let data: PageData;
	const title = data.asset.name;
	let asset: AddOrUpdateAPIResponse; // FIXME: should be CRUDResponse

	const handleSubmit = async (event: any) => {
		let payload: Prisma.AssetUncheckedCreateInput = {
			id: data.asset.id,
			name: event.target.name?.value,
			balanceGroup: parseInt(event.target.balanceGroup?.value),
			assetTypeId: parseInt(event.target.assetTypeId?.value),
			isSold: event.target.isSold?.checked ? true : false,
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

		if (asset.error) {
			$statusBarStore = {
				message: asset.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: 'The asset was updated successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/balanceSheet`);
		}
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

		if (deletedAsset.error) {
			$statusBarStore = {
				message: deletedAsset.error,
				appearance: Appearance.NEGATIVE
			};
		} else {
			$statusBarStore = {
				message: `The asset —${data.asset.name}— was deleted successfully`,
				appearance: Appearance.ACTIVE
			};
			await goto('/balanceSheet');
		}
	};
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="Update asset">
		<div slot="CONTENT">
			<AssetForm
				{handleSubmit}
				asset={data.asset}
				selectAssetTypes={data.selectAssetTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				quantifiableAssetTypes={data.quantifiableAssetTypes}
				lastBalanceStatement={data.lastBalanceStatement}
				error={asset?.error}
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
