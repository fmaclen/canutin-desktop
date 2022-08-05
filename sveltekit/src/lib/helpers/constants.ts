export enum BalanceGroup {
	CASH,
	DEBT,
	INVESTMENTS,
	OTHER_ASSETS
}

export const getBalanceGroupLabel = (balanceGroup: BalanceGroup) => {
	switch (balanceGroup) {
		case BalanceGroup.CASH:
			return 'Cash';
		case BalanceGroup.DEBT:
			return 'Debt';
		case BalanceGroup.INVESTMENTS:
			return 'Investments';
		case BalanceGroup.OTHER_ASSETS:
			return 'Other assets';
	}
};

export enum SortOrder {
	DESC = 'desc',
	ASC = 'asc'
}

export enum TrailingCashflowPeriods {
	LAST_6_MONTHS = 'Last 6 months',
	LAST_12_MONTHS = 'Last 12 months'
}

export enum DeveloperFunctions {
	DB_WIPE,
	DB_SEED
}
