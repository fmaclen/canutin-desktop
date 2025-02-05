<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';
	import MainHeader from '$lib/components/MainHeader.svelte';
</script>

<Head title={$LL.ADD_OR_UPDATE_DATA()} />

<MainHeader>
	<H1>{$LL.ADD_OR_UPDATE_DATA()}</H1>
</MainHeader>

<a href="/data/csv">{$LL.IMPORT_TRANSACTIONS_FROM_CSV()}</a>
