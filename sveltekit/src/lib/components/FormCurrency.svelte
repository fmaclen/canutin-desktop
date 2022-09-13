<script lang="ts">
	export let value: number | string;
	export let name: string;
	export let required: boolean = false;
	export let disabled: boolean = false;

	const LOCALE = 'en-US';
	const CURRENCY = 'USD';

	const currencyDecimal = new Intl.NumberFormat(LOCALE).format(1.1).charAt(1);
	const placeholder = new Intl.NumberFormat(LOCALE, {
		style: 'currency',
		currency: CURRENCY,
		maximumFractionDigits: 2,
		minimumFractionDigits: 2
	}).format(0);

	let formattedValue = placeholder;
	$: isZero = value === 0;
	$: isNegative = value < 0;

	const formatValue = (event?: KeyboardEvent) => {
		// Don't format if the user is typing a currencyDecimal point
		if (event?.key === currencyDecimal) return;
		// Make sure the value is a number at this point
		if (typeof value === 'string') value = parseFloat(value);

		// Remove currency formatting from `formattedValue` so we can assign it to `value`
		if (formattedValue !== placeholder) {
			const isDecimalComma = currencyDecimal === ',';
			// Remove all characters that arent: numbers, commas, periods or minus signs
			let unformattedValue = formattedValue.replace(/[^0-9,.-]/g, '');

			if (Number.isNaN(parseFloat(unformattedValue))) {
				value = 0; // Set the value as 0 if the user has entered a value that doesn't contain numbers
			} else {
				// Remove all group symbols
				unformattedValue = unformattedValue.replace(isDecimalComma ? /\./g : /\,/g, '');
				// If the decimal point is a comma, replace it with a period
				if (isDecimalComma) unformattedValue = unformattedValue.replace(',', '.');
				value = parseFloat(unformattedValue);
			}
		}

		// Revert sign when "minus" is pressed
		if (event?.key === '-') value = value * -1;

		isZero = value === 0;
		isNegative = value < 0;

		formattedValue = new Intl.NumberFormat(LOCALE, {
			style: 'currency',
			currency: CURRENCY,
			maximumFractionDigits: 2,
			minimumFractionDigits: 0
		}).format(value);
	};

	formatValue();
</script>

<div class="formInput">
	<input type="hidden" {name} bind:value />
	<input
		class="formInput__currency {isZero && 'formInput__currency--zero'} {isNegative &&
			'formInput__currency--negative'}"
		type="text"
		inputmode="numeric"
		{placeholder}
		{required}
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
		color: var(--color-greenPrimary);

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
