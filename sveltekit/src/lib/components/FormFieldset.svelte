<fieldset class="form__fieldset">
	<slot />
</fieldset>

<style lang="scss">
	fieldset.form__fieldset {
		border: none;
		padding: 12px 0;
		display: grid;
		grid-row-gap: 8px;
		margin: 0;
		border-top: 1px solid var(--color-border);

		&:first-child {
			border-top: none;
		}
	}
</style>
