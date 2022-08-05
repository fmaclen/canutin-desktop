import { expect, test } from '@playwright/test';

import { importCanutinFile, databaseSeed, databaseWipe } from './fixtures/helpers.js';

test.describe('Balance sheet', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('Summary totals are calculated correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

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

		// Check that the balanceGroups are in the correct order
		const balanceGroups = page.locator('.bigPictureSummary .card');
		expect(await balanceGroups.count()).toBe(5);
		expect(await balanceGroups.nth(0).textContent()).toMatch('Net worth');
		expect(await balanceGroups.nth(1).textContent()).toMatch('Cash');
		expect(await balanceGroups.nth(2).textContent()).toMatch('Debt');
		expect(await balanceGroups.nth(3).textContent()).toMatch('Investments');
		expect(await balanceGroups.nth(4).textContent()).toMatch('Other assets');
	});

	test('Trailing cashflow totals are calculated correctly', async ({ page, baseURL }) => {
		await page.goto('/');
		const netWorthCard = page.locator('.card', { hasText: 'Net worth' });
		const incomePerMonthCard = page.locator('.card', { hasText: 'Income per month' });
		const expensesPerMonthCard = page.locator('.card', { hasText: 'Expenses per month' });
		const surplusPerMonthCard = page.locator('.card', { hasText: 'Surplus per month' });
		expect(await netWorthCard.textContent()).toMatch('$0');
		expect(await incomePerMonthCard.textContent()).toMatch('$0');
		expect(await expensesPerMonthCard.textContent()).toMatch('$0');
		expect(await surplusPerMonthCard.textContent()).toMatch('$0');

		const last6MonthsButton = page.locator('.segmentedControl__button', {
			hasText: 'Last 6 months'
		});
		const last12MonthsButton = page.locator('.segmentedControl__button', {
			hasText: 'Last 12 months'
		});
		await databaseSeed(baseURL!);
		await page.reload();
		expect(await netWorthCard.textContent()).toMatch('$185,719');
		expect(await incomePerMonthCard.textContent()).toMatch('$7,647');
		expect(await expensesPerMonthCard.textContent()).toMatch('-$6,677');
		expect(await surplusPerMonthCard.textContent()).toMatch('$970');
		await expect(last6MonthsButton).toHaveClass(/segmentedControl__button--active/);
		await expect(last12MonthsButton).not.toHaveClass(/segmentedControl__button--active/);

		await last12MonthsButton.click();
		expect(await incomePerMonthCard.textContent()).toMatch('$7,612');
		expect(await expensesPerMonthCard.textContent()).toMatch('-$6,929');
		expect(await surplusPerMonthCard.textContent()).toMatch('$683');
		await expect(last6MonthsButton).not.toHaveClass(/segmentedControl__button--active/);
		await expect(last12MonthsButton).toHaveClass(/segmentedControl__button--active/);
	});
});
