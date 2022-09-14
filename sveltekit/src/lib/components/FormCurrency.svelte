<script lang="ts">
	import { formatCurrency, LOCALE } from '$lib/helpers/misc';

	export let value: number | string;
	export let name: string;
	export let required: boolean = false;
	export let disabled: boolean = false;
	export let isNegativeAllowed: boolean = true;

	const placeholder = formatCurrency(0, 2, 2); // e.g. '$0.00'
	const currencySymbol = formatCurrency(0, 0).replace('0', ''); // e.g. '$'
	const currencyDecimal = new Intl.NumberFormat(LOCALE).format(1.1).charAt(1); // '.' or ','
	const currenctInputName = `currency${name.replace(/^./g, ($1) => $1.toUpperCase())}`;

	let formattedValue = '';
	$: isZero = valueAsNumber(value) === 0;
	$: isNegative = valueAsNumber(value) < 0;
	$: value, applyFormatting();

	const valueAsNumber = (value: string | number) => {
		if (typeof value === 'string') {
			return Number.isNaN(parseFloat(value)) ? 0 : parseFloat(value);
		} else {
			return value;
		}
	};

	const formatValue = (event?: KeyboardEvent) => {
		// Don't format if the user is typing a currencyDecimal point
		if (event?.key === currencyDecimal) return;

		// If `formattedValue` is ['$', '-$'] we don't want to continue with formatting
		const onlyCurrencySymbols = [currencySymbol, `-${currencySymbol}`, '-'];
		const strippedUnformattedValue = formattedValue.replace(' ', '');
		if (onlyCurrencySymbols.includes(strippedUnformattedValue)) return;

		// Remove all characters that arent: numbers, commas, periods (or minus signs if `isNegativeAllowed`)
		let unformattedValue = isNegativeAllowed
			? formattedValue.replace(/[^0-9,.-]/g, '')
			: formattedValue.replace(/[^0-9,.]/g, '');

		// Reverse the value when minus is pressed
		if (isNegativeAllowed && event?.key === '-') value = valueAsNumber(value) * -1;

		if (Number.isNaN(parseFloat(unformattedValue))) {
			value = 0;
		} else {
			// Remove currency formatting from `formattedValue` so we can assign it to `value`
			const isDecimalComma = currencyDecimal === ',';
			// Remove all group symbols
			unformattedValue = unformattedValue.replace(isDecimalComma ? /\./g : /\,/g, '');
			// If the decimal point is a comma, replace it with a period
			if (isDecimalComma) unformattedValue = unformattedValue.replace(',', '.');
			value = parseFloat(unformattedValue);
		}

		// Get the value trend
		isZero = value === 0;
		isNegative = value < 0;

		applyFormatting();
	};

	const applyFormatting = () => {
		// Make sure the value is a number at this point
		value = valueAsNumber(value);

		if (isZero) {
			// If the value is 0, reset the formatted value to display the placeholder
			formattedValue = '';
		} else {
			formattedValue = formatCurrency(value, 2, 0);
		}
	};
</script>

<div class="formInput">
	<input class="formInput__input" type="hidden" {name} {disabled} bind:value />
	<input
		class="formInput__currency
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
		on:keyup={formatValue}
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
