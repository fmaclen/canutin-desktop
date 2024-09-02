import { BalanceGroup } from '$lib/helpers/constants';

export const assetSecurityTeslaDetails = {
	name: 'Tesla',
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: 'Security',
	isSold: false,
	symbol: 'TSLA'
};

export const assetSecurityGamestopDetails = {
	name: 'GameStop',
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: 'Security',
	isSold: false,
	symbol: 'GME'
};

export const assetCryptoBitcoinDetails = {
	name: 'Bitcoin',
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: 'Cryptocurrency',
	isSold: false,
	symbol: 'BTC'
};

export const assetCryptoEthereumDetails = {
	name: 'Ethereum',
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: 'Cryptocurrency',
	isSold: false,
	symbol: 'ETH'
};

export const assetCollectibleDetails = {
	name: 'Manchild Card Collection',
	balanceGroup: BalanceGroup.OTHER_ASSETS,
	tag: 'Collectible',
	isSold: false
};

export const assetVehicleDetails = {
	name: `1998 Fiat Multipla`,
	balanceGroup: BalanceGroup.OTHER_ASSETS,
	tag: 'Vehicle',
	isSold: false
};
