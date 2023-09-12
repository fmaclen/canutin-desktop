import { subMonths } from 'date-fns';
import { dateInUTC } from '../../helpers/misc';

// Accounts
export const accountAutoLoanBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		value: -21250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		value: -23500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 2)),
		value: -24000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 3)),
		value: -25500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 4)),
		value: -27000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 5)),
		value: -29500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 6)),
		value: -30000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 7)),
		value: -32500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 8)),
		value: -33000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 9)),
		value: -34500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 10)),
		value: -36000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 11)),
		value: -37500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 12)),
		value: -38000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 13)),
		value: -39500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 14)),
		value: -40000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 15)),
		value: -41500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 16)),
		value: -42000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 17)),
		value: -42500
	}
];

export const accountRothIraBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		value: 18535.78
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		value: 18035.65
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 3)),
		value: 17535.12
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 5)),
		value: 17035.23
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 7)),
		value: 16535.78
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 9)),
		value: 16035.45
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 11)),
		value: 15535.67
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 13)),
		value: 15035.92
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 15)),
		value: 14535.12
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 17)),
		value: 14035.18
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 19)),
		value: 13535.98
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 21)),
		value: 13035.75
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 23)),
		value: 12535.45
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 25)),
		value: 12035.38
	}
];

export const account401kbalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		value: 4250.58
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		value: 4000.25
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 3)),
		value: 3250.66
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 5)),
		value: 3000.33
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 7)),
		value: 2750.49
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 9)),
		value: 2500.58
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 11)),
		value: 2250.25
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 13)),
		value: 2000.78
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 15)),
		value: 1750.9
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 17)),
		value: 1500.32
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 19)),
		value: 1250.29
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 21)),
		value: 1000.45
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 23)),
		value: 750.12
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 25)),
		value: 500.23
	}
];

export const accountWalletBalanceStatements = [
	{
		createdAt: dateInUTC(subMonths(new Date(), 7)),
		value: 1300
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 18)),
		value: 700
	}
];

// Assets

export const assetTeslaBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		quantity: 25,
		cost: 1200,
		value: 30000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		quantity: 25,
		cost: 1100,
		value: 27500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 3)),
		quantity: 25,
		cost: 750,
		value: 18750
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 6)),
		quantity: 25,
		cost: 500,
		value: 12500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 8)),
		quantity: 25,
		cost: 400,
		value: 10000
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 11)),
		quantity: 25,
		cost: 250,
		value: 6250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 15)),
		quantity: 25,
		cost: 125,
		value: 3125
	}
];

export const assetGamestopBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		quantity: 125,
		cost: 25,
		value: 3125
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		quantity: 125,
		cost: 100,
		value: 12500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 2)),
		quantity: 125,
		cost: 325,
		value: 40625
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 4)),
		quantity: 125,
		cost: 300,
		value: 37500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 6)),
		quantity: 125,
		cost: 100,
		value: 12500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 10)),
		quantity: 125,
		cost: 50,
		value: 6250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 13)),
		quantity: 125,
		cost: 25,
		value: 3125
	}
];

export const assetBitcoinBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		quantity: 1.5,
		cost: 46280,
		value: 69420
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 1)),
		quantity: 1.4,
		cost: 43500,
		value: 60900
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 5)),
		quantity: 1.3,
		cost: 33250,
		value: 43225
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 7)),
		quantity: 1.2,
		cost: 40700,
		value: 48840
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 13)),
		quantity: 0.75,
		cost: 25265,
		value: 18948.75
	}
];

export const assetEthereumBalanceStatements = [
	{
		createdAt: dateInUTC(new Date()),
		quantity: 5,
		cost: 3500,
		value: 17500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 3)),
		quantity: 3,
		cost: 2750,
		value: 8250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 9)),
		quantity: 3,
		cost: 1800,
		value: 5400
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 11)),
		quantity: 1,
		cost: 2250,
		value: 2250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 17)),
		quantity: 1.5,
		cost: 1750,
		value: 2625
	}
];

export const assetCollectibleBalanceStatements = [
	{
		createdAt: dateInUTC(subMonths(new Date(), 6)),
		value: 14500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 18)),
		value: 9500
	}
];

export const assetVehicleBalanceStatements = [
	{
		createdAt: dateInUTC(subMonths(new Date(), 4)),
		value: 38500
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 8)),
		value: 40250
	},
	{
		createdAt: dateInUTC(subMonths(new Date(), 14)),
		value: 42500
	}
];
