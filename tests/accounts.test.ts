import { expect, test } from '@playwright/test';

import { createAccount } from '$lib/pocketbase';
import {
	accountCheckingDetails,
	accountCreditCardDetails,
	accountSavingsDetails
} from '$lib/seed/data/accounts';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('user can only see their own accounts', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');
	const userBob = await createVerifiedUniqueUser('bob');

	await createAccount(userAlice.id, accountCheckingDetails);
	await createAccount(userBob.id, accountCreditCardDetails);

	await signInAsUser(page, userAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).not.toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, userBob);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('JuggernautCard Limited Rewards')).toBeVisible();
	await expect(page.getByText('Ransack Laughable-Yield Checking')).not.toBeVisible();
});

test('accounts context is updated in real-time', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');

	await signInAsUser(page, userAlice);
	await page.locator('nav a', { hasText: 'Accounts' }).click();
	await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
	await expect(page.getByText('Emergency Fund')).not.toBeVisible();

	await createAccount(userAlice.id, accountSavingsDetails);
	await expect(page.getByText('Emergency Fund')).toBeVisible();
});
