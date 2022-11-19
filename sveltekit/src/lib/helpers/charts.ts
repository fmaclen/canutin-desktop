import type { ChartDataset } from 'chart.js';
import { add, endOfWeek } from 'date-fns';
import { BalanceGroup } from './constants';

export const setChartDatasetColor = (dataset: ChartDataset, balanceGroup?: BalanceGroup) => {
	switch (balanceGroup) {
		case BalanceGroup.CASH:
			// var(--color-greenPrimary)
			dataset.backgroundColor = '#00A36F';
			dataset.borderColor = '#00A36F';
			break;
		case BalanceGroup.DEBT:
			// var(--color-redPrimary)
			dataset.backgroundColor = '#e75258';
			dataset.borderColor = '#e75258';
			break;
		case BalanceGroup.INVESTMENTS:
			// var(--color-goldPrimary)
			dataset.backgroundColor = '#B19B70';
			dataset.borderColor = '#B19B70';
			break;
		case BalanceGroup.OTHER_ASSETS:
			// var(--color-purplePrimary)
			dataset.backgroundColor = '#5255AC';
			dataset.borderColor = '#5255AC';
			break;
		default:
			// var(--color-grey80)
			dataset.backgroundColor = '#333333';
			dataset.borderColor = '#333333';
	}
};

// Setting the range at the end of the week doesn't include the current week,
// adding an extra day forces the end of range to include the current week.
export const handlePeriodEnd = (periodEnd: Date) => {
	return add(endOfWeek(periodEnd), { days: 1 });
};
