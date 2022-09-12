<script lang="ts">
	export let name: string;
	export let label: string;
	export let checked: boolean;
	export let required: boolean = false;
	export let disabled: boolean = false;
</script>

<label class="formInputCheckbox {disabled && 'formInputCheckbox__disabled'}">
	<input
		class="formInputCheckbox__input"
		type="checkbox"
		{name}
		{required}
		{disabled}
		bind:checked
	/>
	<span class="formInputCheckbox__label">{label}</span>
</label>

<style lang="scss">
	label.formInputCheckbox {
		@import './Form.scss';
		@include baseInput;
		display: flex;
		column-gap: 4px;
		background-color: transparent;
		cursor: pointer;

		&:active,
		&:focus {
			outline-color: var(--color-border);
		}

		&__disabled {
			pointer-events: none;
			cursor: default;
		}
	}

	input.formInputCheckbox__input {
		margin: 0;
	}
</style>
