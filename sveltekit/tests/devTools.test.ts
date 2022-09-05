import { expect, test } from '@playwright/test';
import { databaseWipe } from './fixtures/helpers.js';

test.describe('Developer tools', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('Sidebar link is not visible in production', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('a', { hasText: 'The big picture' })).toBeVisible();
		await expect(page.locator('a', { hasText: 'Developer tools' })).not.toBeVisible();
	});

	test('Vault can be seeded and wiped', async ({ page }) => {
		await page.goto('/');
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

		await page.goto('/devTools');
		await expect(page.locator('h1', { hasText: 'Developer tools' })).toBeVisible();

		// Seed DB
		await page.locator('button', { hasText: 'Seed demo data' }).click();
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch(
			'Database action was performed (likely without errors)'
		);

		await page.locator('button', { hasText: 'Dismiss' }).click();
		expect(await statusBar.textContent()).toMatch(
			'Database action was performed (likely without errors)'
		);

		await page.goto('/');
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$185,719');

		// Wipe DB
		await page.goto('/devTools');
		await page.locator('button', { hasText: 'Delete all data' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch(
			'Database action was performed (likely without errors)'
		);

		await page.goto('/');
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');
	});
});
