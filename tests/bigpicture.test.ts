import { expect, test } from '@playwright/test';

import {
	createAccount,
	createAccountBalanceStatements,
	createTransactions,
	POCKETBASE_SEED_DEFAULT_PASSWORD
} from '$lib/pocketbase';
import {
	accountCreditCardDetails,
	accountRothIraDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { accountRothIraBalanceStatements } from '$lib/seed/data/balanceStatements';
import {
	accountCreditCardTransactionSet,
	accountSavingsTransactionSet
} from '$lib/seed/data/transactions';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

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
	// TOOO

	// Sign in
	await page.goto('/');
	await page.getByLabel('Email').fill(userAlice.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await expect(page.locator('h1', { hasText: 'The big picture' })).not.toBeVisible();

	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

	// Check the calculations
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
	await expect(netWorthCard).toContainText('$18,725');
	await expect(cashCard).toContainText('$500');
	await expect(debtCard).toContainText('-$311');
	await expect(investmentsCard).toContainText('$18,536');
	await expect(otherAssetsCard).toContainText('$0');
});
