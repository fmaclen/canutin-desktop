// import path from 'path';
// import fs from 'fs';
// import { expect, test } from '@playwright/test';
// import { databaseSetUrl } from './fixtures/helpers.js';

// test.describe('Vault', () => {
// 	const testsPath = path.join(process.cwd(), 'tests');

// 	test('New vault is created, migrated and seeded', async ({ page, baseURL }) => {
// 		const newVaultPath = path.join(testsPath, 'tmp', 'New.test.vault');

// 		// Delete the existing test vault if it exists
// 		if (fs.existsSync(newVaultPath)) fs.unlinkSync(newVaultPath);
// 		expect(fs.existsSync(newVaultPath)).toBe(false);

// 		await databaseSetUrl(baseURL!, `file:${newVaultPath}`);
// 		await page.goto('/balanceSheet');
// 		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
// 		await expect(page).toHaveURL('/');
// 		await expect(page).not.toHaveURL(/.*balanceSheet/);
// 		await expect(page.locator('.layout__a').first()).not.toHaveClass(/layout__a--disabled/);

// 		await page.reload();
// 		await expect(
// 			page.locator('.statusBar', { hasText: 'Vault data was last updated less than 5 seconds ago' })
// 		).toBeVisible();
// 		expect(fs.existsSync(newVaultPath)).toBe(true);
// 	});

// 	test.describe('Invalid vaults', () => {
// 		test("Can't be migrated", async ({ page, baseURL }) => {
// 			const umigratableVaultPath = path.join(testsPath, 'fixtures', 'Unmigratable.vault.test');

// 			await databaseSetUrl(baseURL!, `file:${umigratableVaultPath}`);
// 			await page.goto('/');
// 			await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
// 			await expect(page).toHaveURL(/.*vault/);
// 			expect(await page.textContent('p.notice--error')).toBe(
// 				`The vault at ${umigratableVaultPath} couldn't be migrated`
// 			);
// 			await expect(page.locator('.layout__a').first()).toHaveClass(/layout__a--disabled/);
// 		});

// 		test("Can't be seeded", async ({ page, baseURL }) => {
// 			const unseedableVaultPath = path.join(testsPath, 'fixtures', 'Unseedable.vault.test');

// 			await databaseSetUrl(baseURL!, `file:${unseedableVaultPath}`);
// 			await page.goto('/');
// 			await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
// 			await expect(page).toHaveURL(/.*vault/);
// 			expect(await page.textContent('p.notice--error')).toBe(
// 				`The vault at ${unseedableVaultPath} wasn't seeded correctly`
// 			);
// 			await expect(page.locator('.layout__a').first()).toHaveClass(/layout__a--disabled/);
// 		});
// 	});
// });
