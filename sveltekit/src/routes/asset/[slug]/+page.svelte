<script lang="ts">
	import ScrollView from '$lib/components/ScrollView.svelte';
	import AssetDetails from '../AssetDetails.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	$: error = '';

	const handleSubmit = async (event: any) => {
		const response = await fetch('/asset.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: event.target.name.value,
				symbol: event.target.symbol?.value,
				balanceGroup: parseInt(event.target.balanceGroup.value),
				assetTypeId: parseInt(event.target.assetTypeId.value)
			})
		});
		const asset = await response.json();

		if (asset.error) {
			error = asset.error;
		} else {
			alert(`Asset created! (Id: ${asset.id})`);
		}
	};

	const title = data.asset.name;
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<ScrollView {title}>
	<AssetDetails
		{handleSubmit}
		asset={data.asset}
		selectAssetTypes={data.selectAssetTypes}
		selectBalanceGroups={data.selectBalanceGroups}
		quantifiableAssetTypes={data.quantifiableAssetTypes}
		nameError={error}
	/>
</ScrollView>
