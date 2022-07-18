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
