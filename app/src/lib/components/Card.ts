import { BalanceGroup } from '$lib/helpers/constants';

export enum CardAppearance {
	SECONDARY = 'secondary',
	CASH = 'cash',
	DEBT = 'debt',
	INVESTMENTS = 'investments',
	OTHER_ASSETS = 'otherAssets',
	NET_WORTH = 'netWorth'
}

export const balanceGroupAppearance = (balanceGroup: BalanceGroup) => {
	switch (balanceGroup) {
		case BalanceGroup.CASH:
			return CardAppearance.CASH;
		case BalanceGroup.DEBT:
			return CardAppearance.DEBT;
		case BalanceGroup.INVESTMENTS:
			return CardAppearance.INVESTMENTS;
		default:
			return CardAppearance.OTHER_ASSETS;
	}
};
