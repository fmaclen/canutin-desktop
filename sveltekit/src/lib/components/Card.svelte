<script lang="ts">
	import type { CardAppearance } from './Card';

	export let title: string;
	export let value: string | number;
	export let appearance: CardAppearance | null = null;
</script>

<div class="card {appearance && `card--${appearance}`}">
	<p class="card__title">{title}</p>
	<p class="card__value {appearance && `card__value--${appearance}`}">{value}</p>
</div>

<style lang="scss">
	div.card {
		display: grid;
		grid-auto-flow: column;
		grid-gap: 16px;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		box-shadow: var(--box-shadow);
		border-radius: 4px;
		background-color: var(--color-neutral-0);

		&--secondary {
			box-shadow: none;
			border: 1px solid var(--color-border);
			background-color: transparent;
		}

		&--cash {
			color: var(--color-white);
			background-color: var(--color-greenPrimary);
		}

		&--debt {
			color: var(--color-white);
			background-color: var(--color-redPrimary);
		}

		&--investments {
			color: var(--color-white);
			background-color: var(--color-goldPrimary);
		}

		&--otherAssets {
			color: var(--color-white);
			background-color: var(--color-purplePrimary);
		}

		&--netWorth {
			color: var(--color-white);
			background-color: var(--color-netWorth);
			grid-auto-flow: row;
			grid-area: 1 / 1 / 3 / 2;
		}
	}

	p.card__title {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	p.card__value {
		font-family: var(--font-monospace);
		margin: 0;
		font-size: 14px;
		line-height: 1em;

		&--netWorth {
			margin-top: auto;
			font-size: 28px;
		}
	}
</style>
