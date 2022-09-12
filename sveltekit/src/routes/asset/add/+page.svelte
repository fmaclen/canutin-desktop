<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Prisma } from '@prisma/client';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import Section from '$lib/components/Section.svelte';
	import AssetForm from '../AssetForm.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { PageData } from './$types';
	import type { AddOrUpdateAPI } from '$lib/helpers/forms';

	export let data: PageData;
	let asset: AddOrUpdateAPI;

	const handleSubmit = async (event: any) => {
		const payload: Prisma.AssetUncheckedCreateInput = {
			name: event.target.name?.value,
			symbol: event.target.symbol?.value,
			balanceGroup: parseInt(event.target.balanceGroup?.value),
			assetTypeId: parseInt(event.target.assetTypeId?.value),
			isSold: event.target.isSold?.checked ? true : false,
			assetBalanceStatements: {
				create: [
					{
						quantity: parseFloat(event.target.quantity?.value),
						cost: parseFloat(event.target.cost?.value),
						value: parseFloat(event.target.value.value)
					}
				]
			}
		};
		asset = await api({ endpoint: 'asset', method: 'POST', payload });

		if (asset.error) {
			if (!asset.error.name) {
				$statusBarStore = {
					message: "An error ocurred and the asset likely wasn't added",
					appearance: Appearance.NEGATIVE
				};
			}
		} else {
			$statusBarStore = {
				message: 'The asset was added successfully',
				appearance: Appearance.POSITIVE
			};
			await goto(`/asset/${asset.id}`);
		}
	};

	const title = 'Add asset';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<Section title="New asset">
		<div slot="CONTENT">
			<AssetForm
				{handleSubmit}
				selectAssetTypes={data.selectAssetTypes}
				selectBalanceGroups={data.selectBalanceGroups}
				quantifiableAssetTypes={data.quantifiableAssetTypes}
				error={asset?.error}
				submitButtonLabel="Add"
			/>
		</div>
	</Section>
</ScrollView>
