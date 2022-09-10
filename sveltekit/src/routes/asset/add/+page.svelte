<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollView from '$lib/components/ScrollView.svelte';
	import AssetDetails from '../AssetDetails.svelte';
	import statusBarStore from '$lib/stores/statusBarStore';
	import { api } from '$lib/helpers/misc';
	import { Appearance } from '$lib/helpers/constants';
	import type { AssetFormPayload } from '$lib/helpers/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	$: nameError = '';

	const handleSubmit = async (event: any) => {
		const payload: AssetFormPayload = {
			assetForm: {
				name: event.target.name.value,
				symbol: event.target.symbol?.value,
				balanceGroup: parseInt(event.target.balanceGroup.value),
				assetTypeId: parseInt(event.target.assetTypeId.value)
			}
		};
		const asset = await api('asset', payload, 'POST');

		if (asset.error) {
			nameError = asset.error.name;
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
	<AssetDetails
		{handleSubmit}
		selectAssetTypes={data.selectAssetTypes}
		selectBalanceGroups={data.selectBalanceGroups}
		quantifiableAssetTypes={data.quantifiableAssetTypes}
		{nameError}
	/>
</ScrollView>
