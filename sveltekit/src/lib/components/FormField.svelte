<script lang="ts">
	export let label: string;
	export let name: string;
	export let optional: boolean = false;
</script>

<div class="form__field">
	<label class="form__label" for={name}>
		{label}

		{#if optional}
			<span class="form__optional">Optional</span>
		{/if}
	</label>
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
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		margin-left: auto;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--color-neutral-700);
		max-height: 40px;
	}

	span.form__optional {
		font-weight: 400;
		color: var(--color-neutral-400);
	}
</style>
