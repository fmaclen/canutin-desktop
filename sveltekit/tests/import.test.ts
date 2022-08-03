import fs from 'fs';
import fetch from 'node-fetch';
import { expect, test } from '@playwright/test';
import { checkVaultIsDev, wipeVault } from './fixtures/helpers.js';

test.describe('Import data', () => {
	test.beforeAll(() => {
		checkVaultIsDev();
	});

	test.beforeEach(async () => {
		await wipeVault();
	});

	test('CanutinFile at different levels of provided data', async ({ page }) => {
		await page.goto('/');
		const sidebarImportData = page.locator('a', { hasText: 'Import data' });
		await sidebarImportData.click();
		await expect(page.locator('h1', { hasText: 'Import data' })).toBeVisible();

		// Try to import invalid CanutinFile
		const importStatus = page.locator('.importStatus');
		expect(await importStatus.count()).toBe(0);
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-insufficient-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();

		expect(await page.textContent('p.notice--error')).toBe('The CanutinFile provided is invalid');
		expect(await importStatus.count()).toBe(0);

		// Import some data
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-minimum-data.json'
		);
		await page.pause();
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.notice--error')).toBeNull();

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
		await sidebarImportData.click();
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-maximum-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.notice--error')).toBeNull();

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
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$650');
		expect(
			await page.locator('.card', { hasText: "Bob's Laughable-Yield Checking" }).textContent()
		).toMatch('$650');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('-$50');
		expect(
			await page.locator('.card', { hasText: "Alice's Limited Rewards" }).textContent()
		).toMatch('-$50');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch(
			'$69,420'
		);
		expect(await page.locator('.card', { hasText: 'Bitcoin' }).textContent()).toMatch('$69,420');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch(
			'$6,571'
		);
		expect(await page.locator('.card', { hasText: '1998 Fiat Multipla' }).textContent()).toMatch(
			'$6,571'
		);
	});

	test('CanutinFile that only contains Accounts can be imported', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Import data' }).click();
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-only-accounts.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.notice--error')).toBeNull();

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$750');
	});

	test('CanutinFile that only contains Assets can be imported', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Import data' }).click();
		await page.setInputFiles('input[type="file"]', './tests/fixtures/canutinFile-only-assets.json');
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.notice--error')).toBeNull();

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$75,991');
	});

	test('UI is rendered correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Import data' }).click();
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`Submit a POST request to`
		);
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`${baseURL}/import.json with a CanutinFile payload`
		);
		expect(await page.locator('section', { hasText: 'Manually' }).textContent()).toMatch('Upload');
	});

	test('submitting a CanutinFile via import json endpoint', async ({ page, baseURL }) => {
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
