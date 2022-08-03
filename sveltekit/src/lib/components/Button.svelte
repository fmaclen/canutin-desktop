<script lang="ts">
	export let isNegative: boolean = false;
</script>

<button type="submit" class="button {isNegative && 'button--negative'}"><slot /></button>

<style lang="scss">
	button.button {
		border-radius: 4px;
		border: none;
		padding: 8px 12px;
		letter-spacing: -0.03em;
		font-size: 12px;
		font-weight: 600;
		font-family: var(--font-sansSerif);
		background-color: var(--color-bluePrimary);
		color: var(--color-white);
		cursor: pointer;

		&:active {
			transform: scale(0.95);
		}

		&--negative {
			background-color: var(--color-redPrimary);
			color: var(--color-white);
		}
	}
</style>
