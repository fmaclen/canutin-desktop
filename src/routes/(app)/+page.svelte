<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import H1 from '$lib/components/H1.svelte';
	import Head from '$lib/components/Head.svelte';

	import Cashflows from './Cashflows.svelte';
	import Summary from './Summary.svelte';
</script>

<Head title={$LL.THE_BIG_PICTURE()} />

	<H1>{$LL.THE_BIG_PICTURE()}</H1>

<Summary />
<Cashflows />
