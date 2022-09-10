<script lang="ts">
	export let name: string;
	export let label: string;
	export let checked: boolean;
	export let required: boolean = false;
	export let disabled: boolean = false;
</script>

<label class="formInputCheckbox">
	<input class="formInputCheckbox__input" type="checkbox" {name} {checked} {required} {disabled} />
	<span class="formInputCheckbox__label">{label}</span>
</label>

<style lang="scss">
	label.formInputCheckbox {
		@import './Form.scss';
		@include baseInput;
		display: flex;
		column-gap: 4px;
		background-color: transparent;

		&:disabled {
			pointer-events: none;
			background-color: var(--color-grey10);
		}
	}

	input.formInputCheckbox__input {
		margin: 0;
	}
</style>
