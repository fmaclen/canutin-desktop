<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
</script>

<Head title={$LL.SETTINGS()} />

<MainHeader>
	<H1>{$LL.SETTINGS()}</H1>
</MainHeader>
