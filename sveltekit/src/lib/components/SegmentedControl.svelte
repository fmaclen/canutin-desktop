<script lang="ts">
	export let segments: string[];
	export let currentSegment: string;
	export let callback: Function;
</script>

<nav class="segmentedControl">
	{#each segments as segment}
		<button
			type="button"
			class="segmentedControl__button {currentSegment == segment &&
				'segmentedControl__button--active'}"
			on:click={() => callback(segment)}>{segment}</button
		>
	{/each}
</nav>

<style lang="scss">
	nav.segmentedControl {
		display: grid;
		grid-gap: 4px;
		grid-auto-flow: column;
	}

	button.segmentedControl__button {
		font-family: var(--font-monospace);
		text-transform: uppercase;
		font-size: 12px;
		line-height: 1em;
		border: none;
		background-color: var(--color-grey10);
		padding: 6px 8px;
		border-radius: 4px;
		color: var(--color-grey50);
		cursor: pointer;

		&:hover {
			color: var(--color-grey70);
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-white);
			box-shadow: var(--box-shadow);
			pointer-events: none;
		}
	}
</style>
