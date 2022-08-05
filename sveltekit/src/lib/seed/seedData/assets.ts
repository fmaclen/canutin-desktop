import { BalanceGroup } from '$lib/helpers/constants';
import { getModelType } from '$lib/helpers/models';

export const assetSecurityTeslaDetails = {
	name: 'Tesla',
	balanceGroup: BalanceGroup.INVESTMENTS,
	assetTypeId: await getModelType('security', false),
	isSold: false,
	symbol: 'TSLA'
};

export const assetSecurityGamestopDetails = {
	name: 'GameStop',
	balanceGroup: BalanceGroup.INVESTMENTS,
	assetTypeId: await getModelType('security', false),
	isSold: false,
	symbol: 'GME'
};

export const assetCryptoBitcoinDetails = {
	name: 'Bitcoin',
	balanceGroup: BalanceGroup.INVESTMENTS,
	assetTypeId: await getModelType('cryptocurrency', false),
	isSold: false,
	symbol: 'BTC'
};

export const assetCryptoEthereumDetails = {
	name: 'Ethereum',
	balanceGroup: BalanceGroup.INVESTMENTS,
	assetTypeId: await getModelType('cryptocurrency', false),
	isSold: false,
	symbol: 'ETH'
};

export const assetCollectibleDetails = {
	name: 'Manchild Card Collection',
	balanceGroup: BalanceGroup.OTHER_ASSETS,
	assetTypeId: await getModelType('collectible', false),
	isSold: false
};

export const assetVehicleDetails = {
	name: `1998 Fiat Multipla`,
	balanceGroup: BalanceGroup.OTHER_ASSETS,
	assetTypeId: await getModelType('vehicle', false),
	isSold: false
};
