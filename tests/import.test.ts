import { expect, test } from '@playwright/test';

import { createAccount } from '$lib/pocketbase';
import { accountCheckingDetails } from '$lib/seed/data/accounts';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('imports a CSV file', async ({ page }) => {
	await page.goto('/');
	const pbAlice = await createVerifiedUniqueUser('alice');
	await signInAsUser(page, pbAlice);
	await createAccount(pbAlice, accountCheckingDetails);

	await page.getByText('Balance sheet').click();
	const checkingAccountBalance = page
		.locator('li', { hasText: accountCheckingDetails.name })
		.last();
	await expect(checkingAccountBalance).toContainText('$0');
	await expect(checkingAccountBalance).not.toContainText('-$948');

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
	const importButton = page.getByText('Import', { exact: true });
	await expect(dateField).toBeDisabled();
	await expect(descriptionField).toBeDisabled();
	await expect(amountField).toBeDisabled();
	await expect(tagField).toBeDisabled();

	await accountField.selectOption(accountCheckingDetails.name);
	await expect(page.getByText('Transactions found in file: 0')).toBeVisible();
	await expect(dateField).not.toBeDisabled();
	await expect(descriptionField).not.toBeDisabled();
	await expect(amountField).not.toBeDisabled();
	await expect(tagField).not.toBeDisabled();
	await expect(page.getByText('No data to preview')).toBeVisible();
	expect(await page.locator('tbody tr').count()).toBe(1);

	await dateField.selectOption('Date');
	await expect(page.getByText('No data to preview')).not.toBeVisible();
	expect(await page.locator('tbody tr').count()).toBe(2);
	await expect(page.getByText('Transactions found in file: 2')).toBeVisible();
	await expect(page.getByText('Transactions that can be imported: 0')).toBeVisible();

	const firstRow = page.locator('tbody tr').first();
	await expect(firstRow).toContainText(accountCheckingDetails.name);
	await expect(firstRow).toContainText('Jan 11, 2024');
	await expect(firstRow).toContainText('~');
	await expect(firstRow).not.toContainText('FRESH FRIENDLY GAS-FL');
	await expect(firstRow).not.toContainText('-$765.29');

	await amountField.selectOption('Amount');
	await expect(firstRow).toContainText('-$765.29');

	await tagField.selectOption('Category');
	await expect(firstRow).toContainText('Gas stations');
	await expect(importButton).toBeDisabled();

	await descriptionField.selectOption('Description');
	await expect(firstRow).toContainText('FRESH FRIENDLY GAS-FL');
	await expect(firstRow).not.toContainText('~');
	await expect(importButton).not.toBeDisabled();
	await expect(page.getByText('Transactions that can be imported: 2')).toBeVisible();

	await importButton.click();
	await page.getByText('Balance sheet').click();
	await expect(checkingAccountBalance).not.toContainText('$0');
	await expect(checkingAccountBalance).toContainText('-$948');
});
