import { expect, test } from '@playwright/test';

import {
	createAccount,
	createAccountBalanceStatements,
	createAsset,
	createAssetBalanceStatements,
	createTransactions
} from '$lib/pocketbase';
import {
	account401kDetails,
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { assetCollectibleDetails, assetSecurityTeslaDetails } from '$lib/seed/data/assets';
import {
	account401kBalanceStatements,
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
	const pbAlice = await createVerifiedUniqueUser('alice');

	// Create accounts
	// Balance group 0 / auto-calculated
	const accountSavings = await createAccount(pbAlice, accountSavingsDetails);
	let transactions = await accountSavingsTransactionSet();
	await createTransactions(pbAlice, accountSavings.id, transactions.slice(0, 2));

	// Balance group 1 / auto-calculated
	const accountCreditCard = await createAccount(pbAlice, accountCreditCardDetails);
	transactions = await accountCreditCardTransactionSet();
	await createTransactions(pbAlice, accountCreditCard.id, transactions.slice(0, 2));

	// Balance group 2 / not auto-calculated
	const accountRothIra = await createAccount(pbAlice, accountRothIraDetails);
	await createAccountBalanceStatements(
		pbAlice,
		accountRothIra.id,
		accountRothIraBalanceStatements.slice(0, 2)
	);

	// Create assets
	// Balance group 3
	const assetSecurityTesla = await createAsset(pbAlice, assetSecurityTeslaDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetSecurityTesla.id,
		assetTeslaBalanceStatements.slice(0, 2)
	);

	// Balance group 4
	const assetCollectible = await createAsset(pbAlice, assetCollectibleDetails);
	await createAssetBalanceStatements(
		pbAlice,
		assetCollectible.id,
		assetCollectibleBalanceStatements.slice(0, 2)
	);

	// Check the calculations
	await signInAsUser(page, pbAlice);
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

test('summary totals update in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	const account401k = await createAccount(pbAlice, account401kDetails);

	await signInAsUser(page, pbAlice);
	const netWorthCard = page.locator('.card', { hasText: 'Net worth' });
	const investmentsCard = page.locator('.card', { hasText: 'Investments' });
	await expect(netWorthCard).toContainText('$0');
	await expect(investmentsCard).toContainText('$0');

	await createAccountBalanceStatements(
		pbAlice,
		account401k.id,
		account401kBalanceStatements.slice(0, 1)
	);

	await expect(netWorthCard).toContainText('$4,251');
	await expect(investmentsCard).toContainText('$4,251');
});
