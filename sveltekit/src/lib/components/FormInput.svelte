<script lang="ts">
	export let type: string = 'text';
	export let name: string;
	export let placeholder: string | null = null;
	export let value: string | null = null;
	export let accept: string | null = null;

	const setType = (node: HTMLInputElement) => {
		node.type = type;
	};
</script>

<input class="formInput" use:setType {name} {placeholder} {accept} bind:value on:keyup />

<style lang="scss">
	input.formInput {
		@import './Form.scss';
		@include baseInput;
	}
</style>
