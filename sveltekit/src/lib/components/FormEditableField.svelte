<script lang="ts">
	import FormInputCheckbox from './FormInputCheckbox.svelte';

	export let name: string;
	export let label: string;
	export let checked: boolean;
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let indeterminate: boolean = false;
</script>

<div class="form__editable-field">
	<slot />
	<FormInputCheckbox {name} {label} {required} {disabled} {indeterminate} bind:checked />
</div>

<style lang="scss">
	div.form__editable-field {
		display: grid;
		grid-template-columns: auto max-content;
		column-gap: 8px;
	}
</style>
