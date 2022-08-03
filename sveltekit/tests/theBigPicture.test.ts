import { expect, test } from '@playwright/test';
import { checkVaultIsDev, importCanutinFile, wipeVault } from './fixtures/helpers.js';

test.describe('Balance sheet', () => {
	test.beforeAll(() => {
		checkVaultIsDev();
	});

	test.beforeEach(async () => {
		await wipeVault();
	});

	test('Summary totals are calculated correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		// Check that the balanceGroups are in the correct order
		const balanceGroups = page.locator('.card');
		expect(await balanceGroups.count()).toBe(5);
		expect(await balanceGroups.nth(0).textContent()).toMatch('Net worth');
		expect(await balanceGroups.nth(1).textContent()).toMatch('Cash');
		expect(await balanceGroups.nth(2).textContent()).toMatch('Debt');
		expect(await balanceGroups.nth(3).textContent()).toMatch('Investments');
		expect(await balanceGroups.nth(4).textContent()).toMatch('Other assets');

		// Check that the balacneGroups have the correct amounts
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch('$0');

		// Check that the balanceGroups have the correct amounts after importing data
		await importCanutinFile(baseURL!, 'minimum-data');
		await page.reload();
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$7,571');
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch(
			'$7,571'
		);
	});
});
