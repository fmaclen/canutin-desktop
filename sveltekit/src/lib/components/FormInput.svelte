<script lang="ts">
	export let type: string = 'text';
	export let name: string;
	export let placeholder: string | null = null;
	export let value: string | number | null = null;
	export let accept: string | null = null;
	export let required: boolean = true;
	export let disabled: boolean = false;
	export let error: string = '';

	const setType = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<div class="formInput {error && 'formInput--error'}">
	<input
		class="formInput__input {type === 'number' && 'formInput__input--number'} {error &&
			'formInput__input--error'}"
		{name}
		{placeholder}
		{accept}
		{required}
		{disabled}
		step={type === 'number' ? 'any' : null}
		use:setType
		bind:value
		on:keyup
	/>

	{#if error}
		<p class="formInput__error">{error}</p>
	{/if}
</div>

<style lang="scss">
	div.formInput {
		display: flex;
		flex-direction: column;

		&--error {
			border-radius: 4px;
			background-color: var(--color-redSecondary);
		}
	}

	input.formInput__input {
		@import './Form.scss';
		@include baseInput;
		@include errorInput;
		@include numberInput;

		&:disabled {
			@include disabledInput;
		}
	}

	p.formInput__error {
		font-size: 12px;
		margin: 0;
		color: var(--color-redPrimary);
		border-radius: 4px;
		padding: 8px;
	}
</style>
