import fs from 'fs';
import fetch from 'node-fetch';
import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.beforeAll(() => {
	// Tests will delete all the data in the current database set by DATABASE_URL
	// so we need to check that we are operating on the development vault.
	const DEV_VAULT = 'file:./Canutin.dev.vault';
	const dbUrl = process.env.DATABASE_URL;
	if (dbUrl !== DEV_VAULT)
		throw new Error(`
			Expected "DATABASE_URL" to be "${DEV_VAULT}" but instead it is: "${dbUrl}"
		`);
});

test.describe('Import data', () => {
	test.beforeEach(async () => {
		// Wipe the database before each test
		await prisma.account.deleteMany({});
		await prisma.asset.deleteMany({});
	});

	test('CanutinFile with the minimum required data', async ({ page }) => {
		await page.goto('/');
		expect(await page.textContent('h1')).toBe('The big picture');

		const sidebarImportData = await page.locator('a:has-text("Import data")');
		expect(sidebarImportData).toHaveAttribute('href', '/import');
		expect(sidebarImportData).toHaveClass(/layout__a/);
		expect(sidebarImportData).not.toHaveClass(/layout__a--active/);
		await sidebarImportData.click();

		expect(sidebarImportData).toHaveClass(/layout__a--active/);
		expect(await page.textContent('h1')).toBe('Import data');

		// Try to import invalid CanutinFile
		const importStatus = await page.locator('.importStatus');
		expect(await importStatus.count()).toBe(0);
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-insufficient-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();

		expect(await page.textContent('p.importNotice--error')).toBe(
			'The CanutinFile provided is invalid'
		);
		expect(await importStatus.count()).toBe(0);

		// Import some data
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-minimum-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.importNotice--error')).toBeNull();

		let importStatusSection = await page.locator('data-test-id=accounts-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 0');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Accounts Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 0');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Accounts Transactions'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 0');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = await page.locator('data-test-id=assets-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 0');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Assets Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$50,000');

		// Import CanutinFile with new and duplicated data
		await sidebarImportData.click();
		await page.setInputFiles(
			'input[type="file"]',
			'./tests/fixtures/canutinFile-maximum-data.json'
		);
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.importNotice--error')).toBeNull();

		importStatusSection = await page.locator('data-test-id=accounts-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 1');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Accounts Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 2');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Accounts Transactions'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 4');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		importStatusSection = await page.locator('data-test-id=assets-import-summary');
		expect(await importStatusSection.textContent()).toMatch('Created 1');
		expect(await importStatusSection.textContent()).toMatch('Updated 1');

		importStatusSection = await page.locator('section.section', {
			hasText: 'Assets Balance Statements'
		});
		expect(await importStatusSection.textContent()).toMatch('Created 4');
		expect(await importStatusSection.textContent()).toMatch('Duplicates (Skipped) 0');

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$123,720');

		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('-$5,699');
		expect(await page.locator('.card', { hasText: "Alice's Savings" }).textContent()).toMatch(
			'$1,200'
		);
		expect(
			await page.locator('.card', { hasText: "Bob's Laughable-Yield Checking" }).textContent()
		).toMatch('-$6,899');
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('-$5,699');
		expect(await page.locator('.card', { hasText: "Alice's Savings" }).textContent()).toMatch(
			'$1,200'
		);
		expect(
			await page.locator('.card', { hasText: "Bob's Laughable-Yield Checking" }).textContent()
		).toMatch('-$6,899');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch(
			'$69,420'
		);
		expect(await page.locator('.card', { hasText: 'Bitcoin' }).textContent()).toMatch('$69,420');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch(
			'$60,000'
		);
		expect(await page.locator('.card', { hasText: '2022 Ford F-150' }).textContent()).toMatch(
			'$60,000'
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
		expect(await page.$('p.importNotice--error')).toBeNull();

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('-$3,299');
	});

	test('CanutinFile that only contains Assets can be imported', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Import data' }).click();
		await page.setInputFiles('input[type="file"]', './tests/fixtures/canutinFile-only-assets.json');
		await page.locator('button', { hasText: 'Upload' }).click();
		expect(await page.$('p.importNotice--error')).toBeNull();

		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.textContent('.card__value--netWorth')).toBe('$129,420');
	});

	test('UI is rendered correctly', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Import data' }).click();
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`Submit a POST request to`
		);
		expect(await page.locator('section', { hasText: 'From api' }).textContent()).toMatch(
			`${page.url()}.json with a CanutinFile payload`
		);
		expect(await page.locator('section', { hasText: 'Manually' }).textContent()).toMatch('Upload');
	});

	test('submitting a CanutinFile via import json endpoint', async ({ page }) => {
		await page.goto('/');
		const importEndpoint = `${page.url()}import.json`;
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
			expect(await page.textContent('.card__value--netWorth')).toBe('$50,000');
		});
	});
});
