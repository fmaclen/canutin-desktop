<script lang="ts">
	import type { Appearance } from '$lib/helpers/constants';

	export let appearance: Appearance | null = null;
</script>

<button class="button {appearance && `button--${appearance}`}" on:click><slot /></button>

<style lang="scss">
	button.button {
		border-radius: 4px;
		border: 1px solid var(--color-black-alpha15);
		padding: 8px 12px;
		letter-spacing: -0.03em;
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sansSerif);
		background-color: transparent;
		color: var(--color-grey70);
		cursor: pointer;

		&:hover {
			border-color: var(--color-black-alpha35);
		}

		&:active {
			transform: scale(0.95);
		}

		&--negative {
			background-color: var(--color-redPrimary);
			color: var(--color-white);

			&:hover {
				border-color: var(--color-redPrimary);
			}
		}

		&--active {
			color: var(--color-white);
			background-color: var(--color-bluePrimary);
			border-color: var(--color-bluePrimary);

			&:hover {
				border-color: var(--color-bluePrimary);
			}
		}
	}
</style>
