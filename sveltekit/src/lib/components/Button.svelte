<script lang="ts">
	import type { Appearance } from '$lib/helpers/constants';

	export let disabled: boolean = false;
	export let appearance: Appearance | null = null;
	export let title: string | null = null;
	export let type: string | undefined = undefined;
</script>

<button class="button {appearance && `button--${appearance}`}" {disabled} {title} {type} on:click>
	<slot />
</button>

<style lang="scss">
	button.button {
		border-radius: 4px;
		border: 1px solid var(--color-alpha-dark-150);
		padding: 8px 12px;
		letter-spacing: -0.03em;
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sansSerif);
		background-color: transparent;
		color: var(--color-neutral-700);
		cursor: pointer;

		&:hover {
			border-color: var(--color-alpha-dark-350);
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

		&:disabled {
			color: var(--color-neutral-300);
			background-color: var(--color-neutral-70);
			border-color: var(--color-neutral-70);
			cursor: default;
			pointer-events: none;
		}
	}
</style>
