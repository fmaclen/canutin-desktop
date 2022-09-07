<script lang="ts">
	export let type: string = 'text';
	export let name: string;
	export let placeholder: string | null = null;
	export let value: string | null = null;
	export let accept: string | null = null;
	export let required: boolean = true;
	export let disabled: boolean = false;

	const setType = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<input
	class="formInput"
	{name}
	{placeholder}
	{accept}
	{required}
	{disabled}
	use:setType
	bind:value
	on:keyup
/>

<style lang="scss">
	input.formInput {
		@import './Form.scss';
		@include baseInput;

		&:disabled {
			pointer-events: none;
			background-color: var(--color-grey10);
		}
	}
</style>
