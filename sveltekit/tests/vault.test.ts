import path from 'path';
import fs from 'fs-extra';
import { expect, test } from '@playwright/test';
import { databaseSetUrl } from './fixtures/helpers.js';

test.describe('Vault', () => {
	test.afterEach(async ({ baseURL }) => {
		// Reset DATABASE_URL back to the default value for tests
		await databaseSetUrl(baseURL!, 'file:../tests/tmp/Canutin.test.vault');
	});

	test('new vault is created, migrated and seeded', async ({ page, baseURL }) => {
		const newVaultPath = path.join(process.cwd(), 'tests/tmp/New.test.vault');

		if (fs.existsSync(newVaultPath)) fs.unlinkSync(newVaultPath);
		expect(fs.existsSync(newVaultPath)).toBe(false);

		await databaseSetUrl(baseURL!, `file:${newVaultPath}`);
		await page.goto('/balanceSheed');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page).toHaveURL('/');
		await expect(page).not.toHaveURL(/.*balanceSheet/);
		expect(fs.existsSync(newVaultPath)).toBe(true);
	});

	test("invalid vaults can't be migrated", async ({ page, baseURL }) => {
		const umigratableVaultPath = path.join(process.cwd(), 'tests/fixtures/Unmigratable.vault.test');

		await databaseSetUrl(baseURL!, `file:${umigratableVaultPath}`);
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
		await expect(page).toHaveURL(/.*vault/);
		expect(await page.textContent('p.notice--error')).toBe(
			`The vault at ${umigratableVaultPath} couldn't be migrated`
		);
	});

	test("invalid vaults can't be seeded", async ({ page, baseURL }) => {
		const unseedableVaultPath = path.join(process.cwd(), 'tests/fixtures/Unseedable.vault.test');

		await databaseSetUrl(baseURL!, `file:${unseedableVaultPath}`);
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'Vault' })).toBeVisible();
		await expect(page).toHaveURL(/.*vault/);
		expect(await page.textContent('p.notice--error')).toBe(
			`The vault at ${unseedableVaultPath} wasn't seeded correctly`
		);
	});
});
