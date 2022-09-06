<script lang="ts">
	export let label: string;
	export let name: string;
</script>

<div class="form__field">
	<label class="form__label" for={name}>{label}</label>
	<slot />
</div>

<style lang="scss">
	div.form__field {
		display: grid;
		grid-template-columns: 1.25fr 2fr 0.75fr;
		column-gap: 20px;
	}

	label.form__label {
		display: flex;
		margin-left: auto;
		align-items: center;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--color-grey70);
	}
</style>
