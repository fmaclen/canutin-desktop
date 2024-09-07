import { expect, test } from '@playwright/test';

import {
	createAccount,
	createAccountBalanceStatements,
	createAsset,
	createAssetBalanceStatements,
	createTransactions,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/pocketbase';
import {
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { assetCollectibleDetails, assetSecurityTeslaDetails } from '$lib/seed/data/assets';
import {
	accountRothIraBalanceStatements,
	assetCollectibleBalanceStatements,
	assetTeslaBalanceStatements
} from '$lib/seed/data/balanceStatements';
import {
	accountCreditCardTransactionSet,
	accountSavingsTransactionSet
} from '$lib/seed/data/transactions';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('summary totals by balance group', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');

	// Create accounts
	// Balance group 0 / auto-calculated
	const accountSavings = await createAccount(userAlice.id, accountSavingsDetails);
	let transactions = await accountSavingsTransactionSet();
	await createTransactions(accountSavings.id, transactions.slice(0, 2));

	// Balance group 1 / auto-calculated
	const accountCreditCard = await createAccount(userAlice.id, accountCreditCardDetails);
	transactions = await accountCreditCardTransactionSet();
	await createTransactions(accountCreditCard.id, transactions.slice(0, 2));

	// Balance group 2 / not auto-calculated
	const accountRothIra = await createAccount(userAlice.id, accountRothIraDetails);
	await createAccountBalanceStatements(
		accountRothIra.id,
		accountRothIraBalanceStatements.slice(0, 2)
	);

	// Create assets
	// Balance group 3
	const assetSecurityTesla = await createAsset(userAlice.id, assetSecurityTeslaDetails);
	await createAssetBalanceStatements(
		assetSecurityTesla.id,
		assetTeslaBalanceStatements.slice(0, 2)
	);

	// Balance group 4
	const assetCollectible = await createAsset(userAlice.id, assetCollectibleDetails);
	await createAssetBalanceStatements(
		assetCollectible.id,
		assetCollectibleBalanceStatements.slice(0, 2)
	);

	// Check the calculations
	await signInAsUser(page, userAlice);
	const netWorthCard = page.locator('.card', { hasText: 'Net worth' });
	const cashCard = page.locator('.card', { hasText: 'Cash' });
	const debtCard = page.locator('.card', { hasText: 'Debt' });
	const investmentsCard = page.locator('.card', { hasText: 'Investments' });
	const otherAssetsCard = page.locator('.card', { hasText: 'Other assets' });
	await expect(netWorthCard).toBeVisible();
	await expect(cashCard).toBeVisible();
	await expect(debtCard).toBeVisible();
	await expect(investmentsCard).toBeVisible();
	await expect(otherAssetsCard).toBeVisible();
	await expect(otherAssetsCard).toBeVisible();
	await expect(netWorthCard).toContainText('$63,225');
	await expect(cashCard).toContainText('$500');
	await expect(debtCard).toContainText('-$311');
	await expect(investmentsCard).toContainText('$48,536');
	await expect(otherAssetsCard).toContainText('$14,500');
});
