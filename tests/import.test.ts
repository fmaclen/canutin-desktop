import { expect, test } from '@playwright/test';

import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';
import { createAccount } from '$lib/pocketbase';
import { accountCheckingDetails } from '$lib/seed/data/accounts';

test('imports a CSV file', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Add or update data').click();
	await expect(page.locator('h1', { hasText: 'Import transactions from CSV' })).not.toBeVisible();

	await page.getByText('Import transactions from CSV').click();
	await expect(page.locator('h1', { hasText: 'Import transactions from CSV' })).toBeVisible();

	const accountField = page.getByLabel('Account');
	
	await expect(accountField).toBeDisabled();
	
	await page.getByLabel('File').setInputFiles('tests/fixtures/EUROPEAN_DATE_AND_TAGS.csv');
	await expect(accountField).not.toBeDisabled();

	const dateField = page.getByLabel('Date');
	const descriptionField = page.getByLabel('Description');
	const amountField = page.getByLabel('Amount', { exact: true });
	const tagField = page.getByLabel('Tag');
	await expect(dateField).toBeDisabled();
	await expect(descriptionField).toBeDisabled();
	await expect(amountField).toBeDisabled();
	await expect(tagField).toBeDisabled();

	await accountField.selectOption(accountCheckingDetails.name);
	await expect(dateField).not.toBeDisabled();
	await expect(descriptionField).not.toBeDisabled();
	await expect(amountField).not.toBeDisabled();
	await expect(tagField).not.toBeDisabled();
});
