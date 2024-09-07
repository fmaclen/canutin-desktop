<script lang="ts">
	import { getAssetsContext } from '$lib/assets.svelte';

	const assetsStore = getAssetsContext();
</script>

<h1>Assets</h1>

<pre>{JSON.stringify(assetsStore.assets, null, 2)}</pre>
