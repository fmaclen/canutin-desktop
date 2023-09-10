import { PrismaClient } from '@prisma/client';

import {
	accountCheckingDetails,
	accountSavingsDetails,
	accountCreditCardDetails,
	accountAutoLoanDetails,
	accountRothIraDetails,
	account401kDetails,
	accountWalletDetails
} from './seedData/accounts';
import {
	assetSecurityTeslaDetails,
	assetSecurityGamestopDetails,
	assetCryptoBitcoinDetails,
	assetCryptoEthereumDetails,
	assetCollectibleDetails,
	assetVehicleDetails
} from './seedData/assets';
import {
	accountCheckingTransactionSet,
	accountSavingsTransactionSet,
	accountCreditCardTransactionSet
} from './seedData/transactions';
import {
	account401kbalanceStatements,
	accountAutoLoanBalanceStatements,
	accountRothIraBalanceStatements,
	accountWalletBalanceStatements,
	assetTeslaBalanceStatements,
	assetGamestopBalanceStatements,
	assetBitcoinBalanceStatements,
	assetEthereumBalanceStatements,
	assetCollectibleBalanceStatements,
	assetVehicleBalanceStatements
} from './seedData/balanceStatements';

const prisma = new PrismaClient();

const seedDemoData = async () => {
	// Accounts

	// Account: Checking
	// await prisma.account.create({
	// 	data: {
	// 		...accountCheckingDetails,
	// 		transactions: {
	// 			create: await accountCheckingTransactionSet()
	// 		}
	// 	}
	// });

	// // Account: Savings
	// await prisma.account.create({
	// 	data: {
	// 		...accountSavingsDetails,
	// 		transactions: {
	// 			create: await accountSavingsTransactionSet()
	// 		}
	// 	}
	// });

	// // Account: Credit card
	// await prisma.account.create({
	// 	data: {
	// 		...accountCreditCardDetails,
	// 		transactions: {
	// 			create: await accountCreditCardTransactionSet()
	// 		}
	// 	}
	// });

	// // Account: Auto-loan
	// await prisma.account.create({
	// 	data: {
	// 		...accountAutoLoanDetails,
	// 		accountBalanceStatements: {
	// 			create: accountAutoLoanBalanceStatements
	// 		}
	// 	}
	// });

	// // Account: Roth IRA
	// await prisma.account.create({
	// 	data: {
	// 		...accountRothIraDetails,
	// 		accountBalanceStatements: {
	// 			create: accountRothIraBalanceStatements
	// 		}
	// 	}
	// });

	// // Account: 401K
	// await prisma.account.create({
	// 	data: {
	// 		...account401kDetails,
	// 		accountBalanceStatements: {
	// 			create: account401kbalanceStatements
	// 		}
	// 	}
	// });

	// // Account: Wallet
	// await prisma.account.create({
	// 	data: {
	// 		...accountWalletDetails,
	// 		accountBalanceStatements: {
	// 			create: accountWalletBalanceStatements
	// 		}
	// 	}
	// });

	// // Assets

	// // Asset: Security (Tesla)
	// await prisma.asset.create({
	// 	data: {
	// 		...assetSecurityTeslaDetails,
	// 		assetBalanceStatements: {
	// 			create: assetTeslaBalanceStatements
	// 		}
	// 	}
	// });

	// // Asset: Security (Gamestop)
	// await prisma.asset.create({
	// 	data: {
	// 		...assetSecurityGamestopDetails,
	// 		assetBalanceStatements: {
	// 			create: assetGamestopBalanceStatements
	// 		}
	// 	}
	// });

	// // Asset: Crypto (Bitcoin)
	// await prisma.asset.create({
	// 	data: {
	// 		...assetCryptoBitcoinDetails,
	// 		assetBalanceStatements: {
	// 			create: assetBitcoinBalanceStatements
	// 		}
	// 	}
	// });

	// // Asset: Crypto (Ethereum)
	// await prisma.asset.create({
	// 	data: {
	// 		...assetCryptoEthereumDetails,
	// 		assetBalanceStatements: {
	// 			create: assetEthereumBalanceStatements
	// 		}
	// 	}
	// });

	// Asset: Collectible
	await prisma.asset.create({
		data: {
			...assetCollectibleDetails,
			assetBalanceStatements: {
				create: assetCollectibleBalanceStatements
			}
		}
	});

	// Asset: Vehicle
	await prisma.asset.create({
		data: {
			...assetVehicleDetails,
			assetBalanceStatements: {
				create: assetVehicleBalanceStatements
			}
		}
	});
};

export default seedDemoData;
