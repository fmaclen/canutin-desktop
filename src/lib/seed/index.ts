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
	pb,
	POCKETBASE_SEED_ADMIN_EMAIL,
	POCKETBASE_SEED_DEFAULT_PASSWORD,
	seedUniqueUser
} from '$lib/seed/utils';

function askForConfirmation(question: string): Promise<boolean> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			rl.close();
			resolve(answer.toLowerCase() === 'y');
		});
	});
}

async function deleteAllData(): Promise<void> {
	const collections = [
		'users', // Add users to the list of collections to clear
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

async function getTagId(name: string, type: string): Promise<string | null> {
	try {
		const result = await pb
			.collection('tags')
			.getFirstListItem(`name ~ "${name}" && for = "${type}"`);
		return result.id;
	} catch (error) {
		return null;
	}
}

async function seedTags(): Promise<void> {
	// Check if tags already exist
	const existingTags = await pb.collection('tags').getList(1, 1);

	if (existingTags.totalItems > 0) {
		const confirmed = await askForConfirmation(
			'-> Tags already exist. Do you want to proceed with seeding? (y/n): '
		);
		if (!confirmed) {
			console.warn('-> Seeding cancelled by user');
			return;
		}
	}

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
		const tagId = await getTagId(account.tag, 'accounts');
		await pb.collection('accounts').create({
			...account,
			tag: tagId,
			owner: userId
		});
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
		const tagId = await getTagId(transaction.tag, 'transactions');
		await pb.collection('transactions').create({
			...transaction,
			account: checkingAccount.id,
			tag: tagId
		});
	}

	for (const transaction of savingsTransactions) {
		const tagId = await getTagId(transaction.tag, 'transactions');
		await pb.collection('transactions').create({
			...transaction,
			account: savingsAccount.id,
			tag: tagId
		});
	}

	for (const transaction of creditCardTransactions) {
		const tagId = await getTagId(transaction.tag, 'transactions');
		await pb.collection('transactions').create({
			...transaction,
			account: creditCardAccount.id,
			tag: tagId
		});
	}

	console.warn('-> Transactions seeded successfully');
}

async function seedBalanceStatements(): Promise<void> {
	const accounts = await pb.collection('accounts').getFullList();
	const assets = await pb.collection('asset').getFullList();

	const balanceStatements = [
		{ account: '401k', data: account401kbalanceStatements },
		{ account: 'Auto Loan', data: accountAutoLoanBalanceStatements },
		{ account: 'Roth IRA', data: accountRothIraBalanceStatements },
		{ account: 'Wallet', data: accountWalletBalanceStatements },
		{ asset: 'Tesla', data: assetTeslaBalanceStatements },
		{ asset: 'GameStop', data: assetGamestopBalanceStatements },
		{ asset: 'Bitcoin', data: assetBitcoinBalanceStatements },
		{ asset: 'Ethereum', data: assetEthereumBalanceStatements },
		{ asset: 'Manchild Card Collection', data: assetCollectibleBalanceStatements },
		{ asset: '1998 Fiat Multipla', data: assetVehicleBalanceStatements }
	];

	for (const statement of balanceStatements) {
		const item = statement.account
			? accounts.find((a) => a.name.includes(statement.account))
			: assets.find((a) => a.name === statement.asset);

		if (item) {
			for (const balanceData of statement.data) {
				await pb
					.collection(statement.account ? 'accountBalanceStatements' : 'assetBalanceStatements')
					.create({
						...balanceData,
						[statement.account ? 'account' : 'asset']: item.id
					});
			}
		}
	}

	console.warn('-> Balance statements seeded successfully');
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
		const userAlice = await seedUniqueUser('alice');
		console.warn('-> User created:', userAlice.email, POCKETBASE_SEED_DEFAULT_PASSWORD);

		// Verify the user account by updating the 'verified' field
		await pb.collection('users').update(userAlice.id, {
			verified: true
		});
		console.warn('-> User account verified');

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
