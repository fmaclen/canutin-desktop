<script lang="ts">
	import { goto } from '$app/navigation';

	import ScrollView from '$lib/components/ScrollView.svelte';
	import AssetDetails from '../AssetDetails.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	$: nameError = '';

	const handleSubmit = async (event: any) => {
		const response = await fetch('/asset.json', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				details: {
					name: event.target.name.value,
					symbol: event.target.symbol?.value,
					balanceGroup: event.target.balanceGroup.valueAsNumber,
					assetTypeId: event.target.assetTypeId.valueAsNumber
				}
			})
		});
		const asset = await response.json();

		if (asset.error) {
			nameError = asset.error.name;
		} else {
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
