<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	export let handleDelete: (e: Event) => void;
</script>

<div class="danger-zone">
	<div class="danger-zone__notice">
		<p class="danger-zone__p">
			<slot />
		</p>
		<p class="danger-zone__p danger-zone__p--negative">This action can't be undone</p>
	</div>
	<nav>
		<Button on:click={handleDelete}>Delete</Button>
	</nav>
</div>

<style lang="scss">
	div.danger-zone {
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

	p.danger-zone__p {
		font-size: 12px;
		margin: 0;
		color: var(--color-grey70);

		&--negative {
			color: var(--color-redPrimary);
		}
	}
</style>
