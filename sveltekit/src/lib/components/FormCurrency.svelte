<script lang="ts">
	import { formatCurrency, LOCALE } from '$lib/helpers/misc';

	export let value: number;
	export let name: string;
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let isNegativeAllowed: boolean = true;

	const placeholder = formatCurrency(0, 2, 2); // e.g. '$0.00'
	const currencySymbol = formatCurrency(0, 0).replace('0', ''); // e.g. '$'
	const currencyDecimal = new Intl.NumberFormat(LOCALE).format(1.1).charAt(1); // '.' or ','
	const currenctInputName = `currency${name.replace(/^./g, ($1) => $1.toUpperCase())}`;

	let formattedValue = '';
	$: isZero = value === 0;
	$: isNegative = value < 0;
	$: value, applyFormatting();

	// Updates `value` by stripping away the currency formatting
	const setValue = (event?: KeyboardEvent) => {
		// Don't format if the user is typing a currencyDecimal point
		if (event?.key === currencyDecimal) return;

		// If `formattedValue` is ['$', '-$', "-"] we don't need to continue
		const ignoreSymbols = [currencySymbol, `-${currencySymbol}`, '-'];
		const strippedUnformattedValue = formattedValue.replace(' ', '');
		if (ignoreSymbols.includes(strippedUnformattedValue)) return;

		// Remove all characters that arent: numbers, commas, periods (or minus signs if `isNegativeAllowed`)
		let unformattedValue = isNegativeAllowed
			? formattedValue.replace(/[^0-9,.-]/g, '')
			: formattedValue.replace(/[^0-9,.]/g, '');

		// Reverse the value when minus is pressed
		if (isNegativeAllowed && event?.key === '-') value = value * -1;

		// Finally set the value
		if (Number.isNaN(parseFloat(unformattedValue))) {
			value = 0;
		} else {
			const isDecimalComma = currencyDecimal === ','; // Remove currency formatting from `formattedValue` so we can assign it to `value`
			if (isDecimalComma) unformattedValue = unformattedValue.replace(',', '.'); // If the decimal point is a comma, replace it with a period
			unformattedValue = unformattedValue.replace(isDecimalComma ? /\./g : /\,/g, ''); // Remove all group symbols
			value = parseFloat(unformattedValue);
		}
	};

	const applyFormatting = () => {
		formattedValue = isZero ? '' : formatCurrency(value, 2, 0);
	};
</script>

<div class="formInput">
	<input class="formInput__input" type="hidden" {name} {disabled} bind:value />
	<input
		class="
			formInput__currency
			{isNegativeAllowed && !isZero && !isNegative && 'formInput__currency--positive'}
			{isZero && 'formInput__currency--zero'}
			{isNegativeAllowed && isNegative && 'formInput__currency--negative'}
		"
		type="text"
		inputmode="numeric"
		name={currenctInputName}
		required={required && !isZero}
		{placeholder}
		{disabled}
		bind:value={formattedValue}
		on:keyup={setValue}
	/>
</div>

<style lang="scss">
	div.formInput {
		display: flex;
		flex-direction: column;
	}

	input.formInput__currency {
		@import './Form.scss';
		@include baseInput;
		font-family: var(--font-monospace);

		&--positive {
			color: var(--color-greenPrimary);
		}

		&--zero {
			color: var(--color-grey50);
		}

		&--negative {
			color: var(--color-redPrimary);
		}

		&:disabled {
			@include disabledInput;
		}
	}
</style>
