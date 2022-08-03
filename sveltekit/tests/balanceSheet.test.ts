import { expect, test } from '@playwright/test';
import { checkVaultIsDev, importCanutinFile, wipeVault } from './fixtures/helpers.js';

test.describe('Balance sheet', () => {
	test.beforeEach(async () => {
		checkVaultIsDev();
		await wipeVault();
	});

	test('UI is rendered correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

		const balanceGroups = page.locator('.balanceSheet__balanceGroup');
		expect(await balanceGroups.count()).toBe(4);
		expect(await balanceGroups.nth(0).textContent()).toMatch('Cash');
		expect(await balanceGroups.nth(1).textContent()).toMatch('Debt');
		expect(await balanceGroups.nth(2).textContent()).toMatch('Investments');
		expect(await balanceGroups.nth(3).textContent()).toMatch('Other assets');

		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch('$0');

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
