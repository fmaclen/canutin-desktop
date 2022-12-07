<script lang="ts">
	import { api } from '$lib/helpers/misc';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import { onMount } from 'svelte';

	const ONE_SECOND_IN_MILLISECONDS = 1000;
	const getEvents = () => {
		setTimeout(async () => {
			const events = await api({ endpoint: 'event' });

			for (const event of events) {
				toast.push(event.message);
			}
			getEvents();
		}, ONE_SECOND_IN_MILLISECONDS);
	};

	onMount(() => {
		getEvents();
	});
</script>

<SvelteToast />
