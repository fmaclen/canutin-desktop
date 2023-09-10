// import { expect, test } from '@playwright/test';
// import { databaseSeed, databaseWipe } from './fixtures/helpers.js';

// test.describe('Balance sheet', () => {
// 	test.beforeEach(async ({ baseURL }) => {
// 		await databaseWipe(baseURL!);
// 	});

// 	test('UI is rendered correctly when no data is present', async ({ page }) => {
// 		await page.goto('/');
// 		await page.locator('a', { hasText: 'Balance sheet' }).click();
// 		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

// 		// Check that the balanceGroups are in the correct order
// 		const balanceGroups = page.locator('.balanceSheet__balanceGroup');
// 		expect(await balanceGroups.count()).toBe(4);
// 		expect(await balanceGroups.nth(0).textContent()).toMatch('Cash');
// 		expect(await balanceGroups.nth(1).textContent()).toMatch('Debt');
// 		expect(await balanceGroups.nth(2).textContent()).toMatch('Investments');
// 		expect(await balanceGroups.nth(3).textContent()).toMatch('Other assets');

// 		// Check that the balacneGroups have the correct amounts
// 		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
// 		expect(await page.locator('.card', { hasText: 'Debt' }).textContent()).toMatch('$0');
// 		expect(await page.locator('.card', { hasText: 'Investments' }).textContent()).toMatch('$0');
// 		expect(await page.locator('.card', { hasText: 'Other assets' }).textContent()).toMatch('$0');
// 		expect(await page.locator('p.notice').textContent()).toMatch(
// 			'You can add accounts and assets to your balance sheet by clicking the links above'
// 		);

// 		// Check the top navigation is present
// 		await page.locator('.scrollView__header a', { hasText: 'Add account' }).click();
// 		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

// 		await page.locator('a', { hasText: 'Balance sheet' }).click();
// 		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

// 		await page.locator('.scrollView__header a', { hasText: 'Add asset' }).click();
// 		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

// 		await page.locator('a', { hasText: 'Balance sheet' }).click();
// 		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

// 		await page.locator('.scrollView__header a', { hasText: 'Import' }).click();
// 		await expect(page.locator('h1', { hasText: 'Import CanutinFile' })).toBeVisible();
// 	});

// 	test('Check that the balanceGroups have the correct totals after importing data', async ({
// 		page,
// 		baseURL
// 	}) => {
// 		await databaseSeed(baseURL!);
// 		await page.goto('/');
// 		await page.locator('a', { hasText: 'Balance sheet' }).click();
// 		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

// 		// Cash
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__balanceGroup', { hasText: 'Cash' }).textContent()).toMatch('$10,700');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__typeHeader', { hasText: 'Savings' }).textContent()).toMatch('$6,000');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__typeHeader', { hasText: 'Savings' }).textContent()).toMatch('$6,000');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__item', { hasText: 'Emergency Fund' }).textContent()).toMatch('$6,000');

// 		// Debt
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__balanceGroup', { hasText: 'Debt' }).textContent()).toMatch('-$20,812');

// 		// Investments
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__balanceGroup', { hasText: 'Investments' }).textContent()).toMatch('$142,831');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__typeHeader', { hasText: 'Security' }).textContent()).toMatch('$33,125');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__item', { hasText: 'Tesla' }).textContent()).toMatch('$30,000');
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__item', { hasText: 'GameStop' }).textContent()).toMatch('$3,125');

// 		// Other assets
// 		// prettier-ignore
// 		expect(await page.locator('.balanceSheet__balanceGroup', { hasText: 'Other assets' }).textContent()).toMatch('$53,000');

// 		// Check empty notice is not visible
// 		await expect(page.locator('p.notice')).not.toBeVisible();
// 	});
// });
