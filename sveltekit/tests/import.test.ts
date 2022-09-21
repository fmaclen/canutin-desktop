import fs from 'fs';
import fetch from 'node-fetch';
import { expect, test } from '@playwright/test';
import { databaseWipe } from './fixtures/helpers.js';

test.describe('Import CanutinFile', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('CanutinFile at different levels of provided data', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('a', { hasText: 'Import CanutinFile' })).not.toBeVisible();

		await page.locator('.layout__aside a', { hasText: 'Add or update data' }).click();
		await page.locator('a', { hasText: 'Import CanutinFile' }).click();
		await expect(page.locator('h1', { hasText: 'Import CanutinFile' })).toBeVisible();

		// Try to import invalid CanutinFile
		const importStatus = page.locator('.importStatus');
		expect(await importStatus.count()).toBe(0);
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-insufficient-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();

		expect(await page.locator('.statusBar--negative').textContent()).toMatch(
			'The CanutinFile provided is invalid'
		);
		expect(await importStatus.count()).toBe(0);

		// Import some data
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-minimum-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--negative/);
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('Import was successful');

		// The successful notice can be dismissed
		const dismissButton = page.locator('.button', { hasText: 'Dismiss' });
		expect(dismissButton).toBeVisible();

		await dismissButton.click();
		expect(dismissButton).not.toBeVisible();
		await expect(statusBar).not.toHaveClass(/statusBar--negative/);
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('Import was successful');
		expect(await statusBar.textContent()).toMatch(
			'Vault data was last updated less than 5 seconds ago'
		);

		let importStatusSection = page.locator('data-test-id=accounts-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 0');

		importStatusSection = page.locator('section.section', {
			hasText: 'Accounts Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 0');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = page.locator('section.section', {
			hasText: 'Accounts Transactions'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 0');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = page.locator('data-test-id=assets-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 0');

		importStatusSection = page.locator('section.section', {
			hasText: 'Assets Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$7,571');

		// Import CanutinFile with new and duplicated data
		await expect(page.locator('a', { hasText: 'Import' })).not.toBeVisible();

		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await page.locator('a', { hasText: 'Import' }).click();
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-maximum-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		await expect(statusBar).not.toHaveClass(/statusBar--negative/);

		importStatusSection = page.locator('data-test-id=accounts-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 1');

		importStatusSection = page.locator('section.section', {
			hasText: 'Accounts Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 2');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = page.locator('section.section', {
			hasText: 'Accounts Transactions'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 5');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = page.locator('data-test-id=assets-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 1');

		importStatusSection = page.locator('section.section', {
			hasText: 'Assets Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 3');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 1');
		expect(await page.locator('.importSummary__code').textContent()).toBe(
			'// Duplicates [{"createdAt":1628467200,"value":7570.51}]'
		);

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$76,590');

		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$750');
		// prettier-ignore
		expect(await page.locator('.balanceSheet__item', { hasText: "Bob's Laughable-Yield Checking" }).textContent()).toMatch('$750');
		// prettier-ignore
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('-$150');
		// prettier-ignore
		expect(await page.locator('.balanceSheet__item', { hasText: "Alice's Limited Rewards" }).textContent()).toMatch('-$150');
		// prettier-ignore
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$69,420');
		// prettier-ignore
		expect(await page.locator('.balanceSheet__item', { hasText: 'Bitcoin' }).textContent()).toMatch('$69,420');
		// prettier-ignore
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch('$6,571');
		// prettier-ignore
		expect(await page.locator('.balanceSheet__item', { hasText: '1998 Fiat Multipla' }).textContent()).toMatch('$6,571');
	});

	test('CanutinFile that only contains Accounts can be imported', async ({ page }) => {
		await page.goto('/');
		await page.locator('.layout__aside a', { hasText: 'Add or update data' }).click();
		await page.locator('a', { hasText: 'Import CanutinFile' }).click();
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-only-accounts.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		await expect(page.locator('.statusBar')).not.toHaveClass(/statusBar--negative/);

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$849');
	});

	test('CanutinFile that only contains Assets can be imported', async ({ page }) => {
		await page.goto('/');
		await page.locator('.layout__aside a', { hasText: 'Add or update data' }).click();
		await page.locator('a', { hasText: 'Import CanutinFile' }).click();
		await page.setInputFiles('input[type="file"]', './tests/fixtures/canutinFile-only-assets.json');
		await page.locator('button', { hasText: 'Upload' }).click();
		await expect(page.locator('.statusBar')).not.toHaveClass(/statusBar--negative/);

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$75,991');
	});

	test('UI is rendered correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await page.locator('a', { hasText: 'Import' }).click();
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`Submit a POST request to`
		);
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`${baseURL}/import.json with a CanutinFile payload`
		);
		expect(await page.locator('section', { hasText: 'Manually' }).textContent()).toMatch('Upload');
	});

	test('Submitting a CanutinFile via import json endpoint', async ({ page, baseURL }) => {
		await page.goto('/');
		const importEndpoint = `${baseURL}/import.json`;
		expect(await page.textContent('h1')).toBe('The big picture');
		expect(await page.textContent('.card__value--netWorth')).toBe('$0');

		// Check that it returns an error
		let canutinFile = fs.readFileSync('./tests/fixtures/canutinFile-insufficient-data.json');
		await fetch(importEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: canutinFile
		}).then(async (response) => {
			expect(response.status).toBe(200);

			const importSummary: any = await response.json();
			expect(importSummary.error).toBe('The CanutinFile provided is invalid');
			expect(importSummary.importedAccounts).toBeDefined();
			expect(importSummary.importedAssets).toBeDefined();

			await page.reload();
			expect(await page.textContent('.card__value--netWorth')).toBe('$0');
		});

		// Check it imports the data succesfully
		canutinFile = fs.readFileSync('./tests/fixtures/canutinFile-minimum-data.json');
		await fetch(importEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: canutinFile
		}).then(async (response) => {
			expect(response.status).toBe(200);

			const importSummary: any = await response.json();
			expect(importSummary.error).not.toBeDefined();
			expect(importSummary.importedAccounts).toBeDefined();
			expect(importSummary.importedAssets).toBeDefined();

			await page.reload();
			expect(await page.textContent('.card__value--netWorth')).toBe('$7,571');
		});
	});
});
