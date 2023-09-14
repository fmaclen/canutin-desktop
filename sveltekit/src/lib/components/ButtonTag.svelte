<script lang="ts">
	export let disabled: boolean = false;
	export let isActive: boolean = false;
</script>

<button class="buttonTag {isActive && 'buttonTag--active'}" {disabled} on:click>
	<slot />
</button>

<style lang="scss">
	button.buttonTag {
		font-family: var(--font-monospace);
		font-weight: 400;
		text-transform: uppercase;
		font-size: 11px;
		color: var(--color-neutral-500);
		background-color: var(--color-neutral-100);
		padding: 6px 8px;
		border-radius: 4px;
		width: max-content;
		border: none;
		cursor: pointer;

		&:hover {
			color: var(--color-neutral-700);
		}

		&:disabled {
			pointer-events: none;
		}

		&--active {
			color: var(--color-bluePrimary);
			background-color: var(--color-white);
			box-shadow: var(--box-shadow);
			pointer-events: none;
		}
	}
</style>
