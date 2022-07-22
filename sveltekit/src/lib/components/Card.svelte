<script lang="ts">
	import type { CardAppearance } from './Card';

	export let title: string;
	export let value: string;
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
		justify-content: space-between;
		padding: 16px;
		box-shadow: 0px 4px 15px rgb(0 0 0 / 10%), 0px 1px 1px rgb(0 0 0 / 5%);
		border-radius: 4px;
		background-color: var(--color-white);

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
			background-color: var(--color-purplePrimary);
		}

		&--otherAssets {
			color: var(--color-white);
			background-color: var(--color-goldPrimary);
		}

		&--netWorth {
			color: var(--color-white);
			background-color: var(--color-grey80);
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
