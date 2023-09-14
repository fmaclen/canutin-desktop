<script lang="ts">
	import CurrencyInput from '@canutin/svelte-currency-input';

	export let value: number;
	export let name: string;
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let isNegativeAllowed: boolean = true;
</script>

<div class="formCurrencyInput">
	<CurrencyInput {name} {required} {disabled} {isNegativeAllowed} bind:value />
</div>

<style lang="scss">
	div.formCurrencyInput {
		:global(div.currencyInput) {
			display: flex;
			flex-direction: column;
		}

		:global(input.currencyInput__formatted) {
			@import './Form.scss';
			@include baseInput;
			font-family: var(--font-monospace);
		}

		:global(input.currencyInput__formatted--positive) {
			color: var(--color-greenPrimary);
		}

		:global(input.currencyInput__formatted--zero) {
			color: var(--color-neutral-500);
		}

		:global(input.currencyInput__formatted--negative) {
			color: var(--color-redPrimary);
		}

		:global(input.currencyInput__formatted:disabled) {
			@import './Form.scss';
			@include disabledInput;
		}
	}
</style>
