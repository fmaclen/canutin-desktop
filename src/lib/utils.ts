export const LOCALE = 'en-US';
const CURRENCY = 'USD';

// Format: $1,523.00 || -$1,523.00
export const formatCurrency = (
	value: number,
	maximumFractionDigits?: number,
	minimumFractionDigits?: number
) => {
	return new Intl.NumberFormat(LOCALE, {
		currency: CURRENCY,
		style: 'currency',
		maximumFractionDigits: maximumFractionDigits || 0,
		minimumFractionDigits: minimumFractionDigits || 0
	}).format(value);
};
