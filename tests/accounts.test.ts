import { expect, test } from '@playwright/test';

import { createAccount, createTransactions } from '$lib/pocketbase';
import {
	accountCheckingDetails,
	accountCreditCardDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';
import { accountSavingsTransactionSet } from '$lib/seed/data/transactions';


test('user can only see their own accounts', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');
	const pbBob = await createVerifiedUniqueUser('bob');

	await createAccount(pbAlice, accountCheckingDetails);
	await createAccount(pbBob, accountCreditCardDetails);

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).not.toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, pbBob);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).not.toBeVisible();
});

test('accounts context is updated in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('Emergency Fund')).not.toBeVisible();

	// Create an auto-calculated account
	const accountEmergencyFund = await createAccount(pbAlice, accountSavingsDetails);
	const accountRow = page.locator('tbody tr', { hasText: 'Emergency Fund' });
	await expect(accountRow).toBeVisible();
	await expect(accountRow).toContainText('$0');

	// Create a transaction to update the account balance
	const transactions = await accountSavingsTransactionSet();
	await createTransactions(pbAlice, accountEmergencyFund.id, transactions.slice(0, 1));
	await expect(accountRow).toContainText('$250');
});
