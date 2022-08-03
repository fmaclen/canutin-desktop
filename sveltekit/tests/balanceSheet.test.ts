import { expect, test } from '@playwright/test';
import { checkVaultIsDev, importCanutinFile, wipeVault } from './fixtures/helpers.js';

test.describe('Balance sheet', () => {
	test.beforeAll(() => {
		checkVaultIsDev();
	});

	test.beforeEach(async () => {
		await wipeVault();
	});

	test('UI is rendered correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

		// Check that the balanceGroups are in the correct order
		const balanceGroups = page.locator('.balanceSheet__balanceGroup');
		expect(await balanceGroups.count()).toBe(4);
		expect(await balanceGroups.nth(0).textContent()).toMatch('Cash');
		expect(await balanceGroups.nth(1).textContent()).toMatch('Debt');
		expect(await balanceGroups.nth(2).textContent()).toMatch('Investments');
		expect(await balanceGroups.nth(3).textContent()).toMatch('Other assets');

		// Check that the balacneGroups have the correct amounts
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch('$0');

		// Check that the balanceGroups have the correct amounts after importing data
		await importCanutinFile(baseURL!, 'minimum-data');
		await page.reload();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch(
			'$7,571'
		);
	});
});
