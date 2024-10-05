<script lang="ts">
	import LL from '$i18n/i18n-svelte';

	import Cashflows from './Cashflows.svelte';
	import Summary from './Summary.svelte';
</script>

<h1>{$LL.THE_BIG_PICTURE()}</h1>

<Summary />
<Cashflows />
