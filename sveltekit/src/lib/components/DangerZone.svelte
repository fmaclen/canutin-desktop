<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { UNDOABLE_ACTION } from '$lib/helpers/constants';

	export let handleDelete: (e: Event) => void;
</script>

<div class="dangerZone">
	<div class="dangerZone__notice">
		<p class="dangerZone__p">
			<slot />
		</p>
		<p class="dangerZone__p dangerZone__p--negative">{UNDOABLE_ACTION.split('🚩')[1]}</p>
	</div>
	<nav>
		<Button on:click={handleDelete}>Delete</Button>
	</nav>
</div>

<style lang="scss">
	div.dangerZone {
		display: flex;
		align-items: center;
		justify-content: space-between;
		column-gap: 20px;
		border-radius: 4px;
		border: 1px solid var(--color-border);
		padding: 16px;
		filter: grayscale(100%);

		&:hover {
			filter: grayscale(0%);
		}
	}

	p.dangerZone__p {
		font-size: 12px;
		margin: 0;
		color: var(--color-grey70);

		&--negative {
			color: var(--color-redPrimary);
		}
	}
</style>
