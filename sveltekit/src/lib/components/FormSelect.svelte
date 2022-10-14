<script lang="ts">
	export let value: number | string;
	export let options: { label: string; value?: string | number }[];
	export let name: string;
	export let placeholder: string = '';
	export let disabled: boolean = false;
</script>

<div class="formSelect {disabled && 'formSelect--disabled'}">
	<select class="formSelect__select" type="text" {name} {disabled} bind:value on:change>
		{#if placeholder}
			<option value={0} disabled selected>{placeholder}</option>
		{/if}
		{#each options as { label, value }, i}
			<option value={value || i}>{label}</option>
		{/each}
	</select>
</div>

<style lang="scss">
	div.formSelect {
		position: relative;

		&--disabled {
			@import './Form.scss';
			@include disabledInput;
		}

		&::after {
			display: inline-block;
			position: absolute;
			z-index: 1;
			right: 0;
			top: 50%;
			transform: translateY(-50%);
			pointer-events: none;
			width: 20px;
			font-size: 8px;
			content: '▼';
			color: currentColor;
		}
	}

	select.formSelect__select {
		@import './Form.scss';
		@include baseInput;

		&:disabled {
			@include disabledInput;
		}

		appearance: none;
		width: 100%;
		padding-right: 32px; // Accounts for the `▼` icon
	}
</style>
