import readline from 'readline';

import {
	account401kDetails,
	accountAutoLoanDetails,
	accountCheckingDetails,
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails,
	accountWalletDetails,
	type AccountDetails
} from '$lib/seed/demo/accounts';
import {
	assetCollectibleDetails,
	assetCryptoBitcoinDetails,
	assetCryptoEthereumDetails,
	assetSecurityGamestopDetails,
	assetSecurityTeslaDetails,
	assetVehicleDetails,
	type AssetDetails
} from '$lib/seed/demo/assets';
import {
	account401kbalanceStatements,
	accountAutoLoanBalanceStatements,
	accountRothIraBalanceStatements,
	accountWalletBalanceStatements,
	assetBitcoinBalanceStatements,
	assetCollectibleBalanceStatements,
	assetEthereumBalanceStatements,
	assetGamestopBalanceStatements,
	assetTeslaBalanceStatements,
	assetVehicleBalanceStatements
} from '$lib/seed/demo/balanceStatements';
import { accountTypes, assetTypes, transactionCategories } from '$lib/seed/demo/tags';
import {
	accountCheckingTransactionSet,
	accountCreditCardTransactionSet,
	accountSavingsTransactionSet
} from '$lib/seed/demo/transactions';
import {
	createAccount,
	createAccountBalanceStatements,
	createAssetBalanceStatements,
	createTransaction,
	createUniqueUser,
	getTagId,
	pb,
	POCKETBASE_SEED_ADMIN_EMAIL,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/seed/utils';

async function deleteAllData(): Promise<void> {
	const collections = [
		'users',
		'accounts',
		'asset',
		'transactions',
		'accountBalanceStatements',
		'assetBalanceStatements',
		'tags'
	];

	for (const collection of collections) {
		const records = await pb.collection(collection).getFullList();
		for (const record of records) {
			await pb.collection(collection).delete(record.id);
		}
		console.warn(`-> Deleted all records from ${collection}`);
	}
}

async function seedTags(): Promise<void> {
	// Create transaction category tags
	for (const categoryGroup of transactionCategories.categoryGroups) {
		// Create group tag
		await pb.collection('tags').create({
			name: categoryGroup.name,
			for: 'transactions',
			isLabelGroup: true
		});

		// Create individual category tags
		for (const category of categoryGroup.categories) {
			await pb.collection('tags').create({
				name: category.name,
				for: 'transactions',
				isLabelGroup: false
			});
		}
	}

	// Create account type tags
	for (const accountType of accountTypes) {
		await pb.collection('tags').create({
			name: accountType.name,
			for: 'accounts',
			isLabelGroup: false
		});
	}

	// Create asset type tags
	for (const assetType of assetTypes) {
		await pb.collection('tags').create({
			name: assetType.name,
			for: 'assets',
			isLabelGroup: false
		});
	}
	console.warn('-> Tags seeded successfully');
}

async function seedAccounts(userId: string): Promise<void> {
	const accounts: AccountDetails[] = [
		accountCheckingDetails,
		accountSavingsDetails,
		accountCreditCardDetails,
		accountAutoLoanDetails,
		accountRothIraDetails,
		account401kDetails,
		accountWalletDetails
	];

	for (const account of accounts) {
		await createAccount(userId, account);
	}
	console.warn('-> Accounts seeded successfully');
}

async function seedAssets(userId: string): Promise<void> {
	const assets: AssetDetails[] = [
		assetSecurityTeslaDetails,
		assetSecurityGamestopDetails,
		assetCryptoBitcoinDetails,
		assetCryptoEthereumDetails,
		assetCollectibleDetails,
		assetVehicleDetails
	];

	for (const asset of assets) {
		const tagId = await getTagId(asset.tag, 'assets');
		await pb.collection('asset').create({
			...asset,
			tag: tagId,
			owner: userId
		});
	}
	console.warn('-> Assets seeded successfully');
}

async function seedTransactions(): Promise<void> {
	const checkingAccount = await pb
		.collection('accounts')
		.getFirstListItem('name="Bob\'s Laughable-Yield Checking"');
	const savingsAccount = await pb.collection('accounts').getFirstListItem('name="Emergency Fund"');
	const creditCardAccount = await pb
		.collection('accounts')
		.getFirstListItem('name="Alice\'s Limited Rewards"');

	const checkingTransactions = await accountCheckingTransactionSet();
	const savingsTransactions = await accountSavingsTransactionSet();
	const creditCardTransactions = await accountCreditCardTransactionSet();

	for (const transaction of checkingTransactions) {
		await createTransaction(checkingAccount.id, transaction);
	}
	for (const transaction of savingsTransactions) {
		await createTransaction(savingsAccount.id, transaction);
	}
	for (const transaction of creditCardTransactions) {
		await createTransaction(creditCardAccount.id, transaction);
	}
	console.warn('-> Transactions seeded successfully');
}

async function seedBalanceStatements(): Promise<void> {
	const accounts = await pb.collection('accounts').getFullList();
	const assets = await pb.collection('asset').getFullList();

	const accountsWithBalanceStatements = [
		{ account: '401k', data: account401kbalanceStatements },
		{ account: 'Auto Loan', data: accountAutoLoanBalanceStatements },
		{ account: 'Roth IRA', data: accountRothIraBalanceStatements },
		{ account: 'Wallet', data: accountWalletBalanceStatements }
	];

	for (const accountWithBalanceStatements of accountsWithBalanceStatements) {
		const account = accounts.find((a) => a.name.includes(accountWithBalanceStatements.account));
		if (account)
			await createAccountBalanceStatements(account.id, accountWithBalanceStatements.data);
	}
	console.warn('-> Created account balance statements');

	const assetsWithBalanceStatements = [
		{ asset: 'Tesla', data: assetTeslaBalanceStatements },
		{ asset: 'GameStop', data: assetGamestopBalanceStatements },
		{ asset: 'Bitcoin', data: assetBitcoinBalanceStatements },
		{ asset: 'Ethereum', data: assetEthereumBalanceStatements },
		{ asset: 'Manchild Card Collection', data: assetCollectibleBalanceStatements },
		{ asset: '1998 Fiat Multipla', data: assetVehicleBalanceStatements }
	];

	for (const assetWithBalanceStatements of assetsWithBalanceStatements) {
		const asset = assets.find((a) => a.name.includes(assetWithBalanceStatements.asset));
		if (asset) await createAssetBalanceStatements(asset.id, assetWithBalanceStatements.data);
	}
	console.warn('-> Created asset balance statements');
}

async function createAndAuthAsAdmin(): Promise<void> {
	try {
		// Attempt to authenticate with existing admin credentials
		await pb.admins.authWithPassword(POCKETBASE_SEED_ADMIN_EMAIL, POCKETBASE_SEED_DEFAULT_PASSWORD);
		console.warn('-> Admin authenticated successfully');
	} catch (error) {
		console.warn('-> Admin authentication failed, attempting to create new admin account');
		try {
			// Attempt to create a new admin account
			await pb.admins.create({
				email: POCKETBASE_SEED_ADMIN_EMAIL,
				password: POCKETBASE_SEED_DEFAULT_PASSWORD,
				passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD
			});
			console.warn('-> New admin account created successfully');

			// Authenticate with the newly created admin account
			await pb.admins.authWithPassword(
				POCKETBASE_SEED_ADMIN_EMAIL,
				POCKETBASE_SEED_DEFAULT_PASSWORD
			);
			console.warn('-> Authenticated with new admin account');
		} catch (createError) {
			console.warn('-> Failed to create new admin account:', createError);
			throw createError;
		}
	}
}

export async function createAndAuthAsUser() {
	try {
		const userAlice = await createUniqueUser('alice');
		console.warn('-> User created:', userAlice.email, POCKETBASE_SEED_DEFAULT_PASSWORD);

		// Clear the admin auth
		pb.authStore.clear();

		// Auth as the user
		await pb
			.collection('users')
			.authWithPassword(userAlice.email, POCKETBASE_SEED_DEFAULT_PASSWORD);
		console.warn('-> User authenticated');

		return userAlice;
	} catch (error) {
		console.warn('-> Error creating or verifying regular user:', error);
		if (error instanceof Error && 'response' in error) {
			console.warn('-> Detailed error:', JSON.stringify((error as any).response, null, 2));
		}
		throw error;
	}
}

async function main(): Promise<void> {
	try {
		// Admin tasks
		await createAndAuthAsAdmin();
		await deleteAllData();
		await seedTags();

		// User tasks
		const user = await createAndAuthAsUser();
		await seedAccounts(user.id);
		await seedAssets(user.id);
		await seedTransactions();
		await seedBalanceStatements();

		console.warn('-> All data seeded successfully');
		process.exit(0);
	} catch (error) {
		console.warn('-> Error in main function:', error);
		if (error instanceof Error) {
			console.warn('-> Error message:', error.message);
			if ('response' in error) {
				console.warn('-> Detailed error:', JSON.stringify((error as any).response, null, 2));
			}
		}
		process.exit(1);
	}
}

main().catch((e) => {
	console.warn('-> Error:', e);
	process.exit(1);
});
