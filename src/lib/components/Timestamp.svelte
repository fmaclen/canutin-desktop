<script lang="ts">
	import { format } from 'date-fns';

	import { dateInUTC } from '$lib/utils';

	interface Props {
		date?: Date;
	}

	let { date }: Props = $props();

	const formattedValue = $derived(date && format(date, 'MMM d, yyyy'));
</script>

{#if date}
	<time
		datetime={date.toISOString()}
		class="font-mono text-xs tracking-widest text-inherit uppercase"
	>
		{formattedValue}
	</time>
{:else}
	~
{/if}
