import { expect, test } from '@playwright/test';
import { format, startOfMonth, subMonths } from 'date-fns';
import { PrismaClient } from '@prisma/client';

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

	test('Cashflow totals are calculated and rendered in a chart correctly', async ({ page }) => {
		await page.goto('/');
		expect(
			await page.locator('.cashflow__summary .card', { hasText: 'Income' }).textContent()
		).toMatch('$0');
		expect(
			await page.locator('.cashflow__summary .card', { hasText: 'Expenses' }).textContent()
		).toMatch('$0');
		expect(
			await page.locator('.cashflow__summary .card', { hasText: 'Surplus' }).textContent()
		).toMatch('$0');

		const chartPeriods = page.locator('.chart__period');
		expect(await chartPeriods.count()).toBe(13);
		expect(await chartPeriods.nth(0).textContent()).toMatch(
			format(subMonths(new Date(), 12), 'MMM')
		);
		expect(await chartPeriods.nth(0)).not.toHaveClass(/chart__period--active/);
		expect(await chartPeriods.nth(1).textContent()).toMatch(
			format(subMonths(new Date(), 11), 'MMM')
		);
		expect(await chartPeriods.nth(2).textContent()).toMatch(
			format(subMonths(new Date(), 10), 'MMM')
		);
		expect(await chartPeriods.nth(3).textContent()).toMatch(
			format(subMonths(new Date(), 9), 'MMM')
		);
		expect(await chartPeriods.nth(4).textContent()).toMatch(
			format(subMonths(new Date(), 8), 'MMM')
		);
		expect(await chartPeriods.nth(5).textContent()).toMatch(
			format(subMonths(new Date(), 7), 'MMM')
		);
		expect(await chartPeriods.nth(6).textContent()).toMatch(
			format(subMonths(new Date(), 6), 'MMM')
		);
		expect(await chartPeriods.nth(7).textContent()).toMatch(
			format(subMonths(new Date(), 5), 'MMM')
		);
		expect(await chartPeriods.nth(8).textContent()).toMatch(
			format(subMonths(new Date(), 4), 'MMM')
		);
		expect(await chartPeriods.nth(9).textContent()).toMatch(
			format(subMonths(new Date(), 3), 'MMM')
		);
		expect(await chartPeriods.nth(10).textContent()).toMatch(
			format(subMonths(new Date(), 2), 'MMM')
		);
		expect(await chartPeriods.nth(11).textContent()).toMatch(
			format(subMonths(new Date(), 1), 'MMM')
		);

		const thisMonth = format(new Date(), 'MMM');
		expect(await chartPeriods.nth(12).textContent()).toMatch(thisMonth);

		let chartPeriod = page.locator('.chart__period', { hasText: thisMonth });
		expect(await chartPeriod.count()).toBeGreaterThanOrEqual(1);
		expect(await chartPeriod.count()).toBeLessThanOrEqual(2);
		expect(await chartPeriod.last().textContent()).not.toMatch('$1,000');
		expect(chartPeriod.first()).not.toHaveClass(/chart__period--active/);
		expect(chartPeriod.last()).toHaveClass(/chart__period--active/);

		chartPeriod = page.locator('.chart__period', { hasText: 'Jan' });
		expect(await chartPeriod.last().textContent()).toMatch(`Jan '${format(new Date(), 'yy')}`);
		expect(chartPeriod.last()).toHaveClass(/chart__period--january/);

		const seedCashflow = async () => {
			const prisma = new PrismaClient();
			await prisma.account.create({
				data: {
					name: 'Cashflow Test',
					balanceGroup: 0,
					accountTypeId: 1,
					isAutoCalculated: true,
					isClosed: false,
					institution: 'Cashflow Bank',
					transactions: {
						create: [
							{
								description: 'Month 1',
								value: 1000,
								date: startOfMonth(subMonths(new Date(), 0)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 2',
								value: 2000,
								date: startOfMonth(subMonths(new Date(), 1)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 3',
								value: 4000,
								date: startOfMonth(subMonths(new Date(), 2)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 4',
								value: 8000,
								date: startOfMonth(subMonths(new Date(), 3)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 5',
								value: 16000,
								date: startOfMonth(subMonths(new Date(), 4)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 6',
								value: 32000,
								date: startOfMonth(subMonths(new Date(), 5)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 7',
								value: 0,
								date: startOfMonth(subMonths(new Date(), 6)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 8',
								value: -500,
								date: startOfMonth(subMonths(new Date(), 7)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 9',
								value: -1000,
								date: startOfMonth(subMonths(new Date(), 8)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 10',
								value: -2000,
								date: startOfMonth(subMonths(new Date(), 9)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 11',
								value: -4000,
								date: startOfMonth(subMonths(new Date(), 10)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 12',
								value: -8000,
								date: startOfMonth(subMonths(new Date(), 11)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							},
							{
								description: 'Month 13',
								value: -16000,
								date: startOfMonth(subMonths(new Date(), 12)),
								categoryId: 1,
								isExcluded: false,
								isPending: false
							}
						]
					}
				}
			});
		};

		await seedCashflow();
		await page.reload();

		// Hovering over a column highlight them
		expect(await chartPeriods.count()).toBe(13);
		expect(chartPeriods.nth(0)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(3)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(12)).toHaveClass(/chart__period--active/);

		await chartPeriods.nth(0).hover();
		expect(chartPeriods.nth(0)).toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(3)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(12)).not.toHaveClass(/chart__period--active/);

		await chartPeriods.nth(3).hover();
		expect(chartPeriods.nth(0)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(3)).toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(12)).not.toHaveClass(/chart__period--active/);

		await chartPeriods.nth(12).hover();
		expect(chartPeriods.nth(0)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(3)).not.toHaveClass(/chart__period--active/);
		expect(chartPeriods.nth(12)).toHaveClass(/chart__period--active/);

		// Test only the highest, lowest and this month's surplus labels are visible
		const chartLabels = page.locator('.chart__label');
		// One of the periods has a balance of 0 and doesn't have a `.chart__label
		expect(await chartLabels.count()).toBe(12);
		expect(chartLabels.nth(0)).toHaveClass(/chart__label--visible/);
		expect(await chartLabels.nth(0).textContent()).toMatch('-$16,000');
		expect(chartLabels.nth(3)).not.toHaveClass(/chart__label--visible/);
		expect(await chartLabels.nth(3).textContent()).toMatch('-$2,000');
		expect(chartLabels.nth(6)).toHaveClass(/chart__label--visible/);
		expect(await chartLabels.nth(6).textContent()).toMatch('$32,000');
		expect(chartLabels.nth(9)).not.toHaveClass(/chart__label--visible/);
		expect(await chartLabels.nth(9).textContent()).toMatch('$4,000');
		expect(chartLabels.nth(11)).toHaveClass(/chart__label--visible/);
		expect(await chartLabels.nth(11).textContent()).toMatch('$1,000');

		// Hovering over a column makes the label visible
		await chartLabels.nth(3).hover();
		await expect(chartLabels.nth(0)).toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(3)).toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(9)).not.toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(11)).toHaveClass(/chart__label--visible/);

		await chartLabels.nth(9).hover();
		await expect(chartLabels.nth(0)).toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(3)).not.toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(9)).toHaveClass(/chart__label--visible/);
		await expect(chartLabels.nth(11)).toHaveClass(/chart__label--visible/);

		const chartBars = page.locator('.chart__bar');
		// One of the periods has a balance of 0 and doesn't have a `.chart__bar`
		expect(await chartBars.count()).toBe(12);
		await expect(chartBars.nth(0)).toHaveClass(/chart__bar--negative/);
		await expect(chartBars.nth(0)).not.toHaveClass(/chart__bar--postive/);
		await expect(chartBars.nth(6)).toHaveClass(/chart__bar--positive/);
		await expect(chartBars.nth(6)).not.toHaveClass(/chart__bar--negative/);
		await expect(chartBars.nth(11)).toHaveClass(/chart__bar--positive/);
		await expect(chartBars.nth(11)).not.toHaveClass(/chart__bar--negative/);

		const chartGraph = page.locator('.chart__graph');
		// One of the periods has a balance of 0 and doesn't have a `.chart__graph`
		expect(await chartGraph.count()).toBe(12);
		await expect(chartGraph.nth(0)).toHaveAttribute('style', /height: 100%;/);
		await expect(chartGraph.nth(3)).toHaveAttribute('style', /height: 12.5%;/);
		await expect(chartGraph.nth(6)).toHaveAttribute('style', /height: 100%;/);
		await expect(chartGraph.nth(9)).toHaveAttribute('style', /height: 12.5%;/);
		await expect(chartGraph.nth(11)).toHaveAttribute('style', /height: 3.13%;/);

		// The ratio between positive values and negative valus is 2:1
		await expect(page.locator('.chart__barContainer').first()).toHaveAttribute(
			'style',
			/grid-template-rows: 2fr 1px 1fr;/
		);

		// Hovering over a column updates the cashflow summary values
		const incomeSummaryCard = page.locator('.cashflow__summary .card', { hasText: 'Income' });
		const expensesSummaryCard = page.locator('.cashflow__summary .card', { hasText: 'Expenses' });
		const surplusSummaryCard = page.locator('.cashflow__summary .card', { hasText: 'Surplus' });

		await chartPeriods.nth(0).hover();
		expect(await incomeSummaryCard.textContent()).toMatch('$0');
		expect(await expensesSummaryCard.textContent()).toMatch('-$16,000');
		expect(await surplusSummaryCard.textContent()).toMatch('-$16,000');

		await chartPeriods.nth(3).hover();
		expect(await incomeSummaryCard.textContent()).toMatch('$0');
		expect(await expensesSummaryCard.textContent()).toMatch('-$2,000');
		expect(await surplusSummaryCard.textContent()).toMatch('-$2,000');

		await chartPeriods.nth(9).hover();
		expect(await incomeSummaryCard.textContent()).toMatch('$8,000');
		expect(await expensesSummaryCard.textContent()).toMatch('$0');
		expect(await surplusSummaryCard.textContent()).toMatch('$8,000');

		await chartPeriods.nth(12).hover();
		expect(await incomeSummaryCard.textContent()).toMatch('$1,000');
		expect(await expensesSummaryCard.textContent()).toMatch('$0');
		expect(await surplusSummaryCard.textContent()).toMatch('$1,000');
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
		expect(await incomePerMonthCard.textContent()).toMatch('$7,577');
		expect(await expensesPerMonthCard.textContent()).toMatch('-$7,137');
		expect(await surplusPerMonthCard.textContent()).toMatch('$440');
		await expect(last6MonthsButton).toHaveClass(/segmentedControl__button--active/);
		await expect(last12MonthsButton).not.toHaveClass(/segmentedControl__button--active/);

		await last12MonthsButton.click();
		expect(await incomePerMonthCard.textContent()).toMatch('$7,612');
		expect(await expensesPerMonthCard.textContent()).toMatch('-$7,167');
		expect(await surplusPerMonthCard.textContent()).toMatch('$445');
		await expect(last6MonthsButton).not.toHaveClass(/segmentedControl__button--active/);
		await expect(last12MonthsButton).toHaveClass(/segmentedControl__button--active/);
	});
});
