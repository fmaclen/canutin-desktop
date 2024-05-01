import { expect, test } from '@playwright/test';
import {
	databaseWipe,
	databaseSeed,
	MAX_DIFF_PIXEL_RATIO,
	setSnapshotPath
} from './fixtures/helpers.js';

test.describe('Trends', () => {
	test('Charts are rendered correctly', async ({ page, baseURL }, testInfo) => {
		setSnapshotPath(testInfo);
		await databaseWipe(baseURL!);
		await databaseSeed(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Trends' }).click();
		await expect(page.locator('h1', { hasText: 'Trends' })).toBeVisible();

		const charts = page.locator('.chart canvas');
		expect(await charts.count()).toBe(5);

		await charts.nth(0).hover();
		expect(await charts.nth(0).screenshot()).toMatchSnapshot({
			name: 'chart-netWorth.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});

		await charts.nth(1).hover();
		expect(await charts.nth(1).screenshot()).toMatchSnapshot({
			name: 'chart-cash.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});

		await charts.nth(2).hover();
		expect(await charts.nth(2).screenshot()).toMatchSnapshot({
			name: 'chart-debt.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});

		await charts.nth(3).hover();
		expect(await charts.nth(3).screenshot()).toMatchSnapshot({
			name: 'chart-investments.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});

		await charts.nth(4).hover();
		expect(await charts.nth(4).screenshot()).toMatchSnapshot({
			name: 'chart-otherAssets.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});
	});

	test('Page renders correctly with no data', async ({ page, baseURL }) => {
		await databaseWipe(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Trends' }).click();
		await expect(page.locator('h1', { hasText: 'Trends' })).toBeVisible();
		await expect(page.getByText("Balance history doesn't have enough data points to calculate net worth trends")).toBeVisible(); // prettier-ignore
		await expect(page.getByText("Balance history doesn't have enough data points to cash trends")).toBeVisible(); // prettier-ignore
		await expect(page.getByText("Balance history doesn't have enough data points to debt trends")).toBeVisible(); // prettier-ignore
		await expect(page.getByText("Balance history doesn't have enough data points to investment trends")).toBeVisible(); // prettier-ignore
		await expect(page.getByText("Balance history doesn't have enough data points to asset trends")).toBeVisible(); // prettier-ignore
	});

	test('Balance type performances are calculated correctly', async ({ page, baseURL }) => {
		await databaseWipe(baseURL!);
		await databaseSeed(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Trends' }).click();
		await expect(page.locator('h1', { hasText: 'Trends' })).toBeVisible();
		await expect(page.locator('.tableValue')).toHaveCount(35);

		// NOTE: some of these values were updated on a leap year and they may break
		// in non-leap years. Old updated values are commented out.
		await expect(page.locator('.table__sortable--active', { hasText: "1 week" })).not.toBeVisible();
		// const oneWeekNetWorth = page.locator('.table__tr:nth-child(1) .table__td:nth-child(2) .tableValue', { hasText: "+9.9%" })
		const oneWeekNetWorth = page.locator('.table__tr:nth-child(1) .table__td:nth-child(2) .tableValue', { hasText: "+7.07%" })
		await expect(oneWeekNetWorth).toBeVisible();
		await expect(oneWeekNetWorth).toHaveAttribute("title", "From $173,456.37")

		await expect(page.locator('.table__sortable--active', { hasText: "1 month" })).not.toBeVisible();
		const oneMonthInvestments = page.locator('.table__tr:nth-child(2) .table__td:nth-child(3) .tableValue', { hasText: "+8.88%" })
		await expect(oneMonthInvestments).toBeVisible();
		await expect(oneMonthInvestments).toHaveAttribute("title", "From $131,185.90")

		await expect(page.locator('.table__sortable--active', { hasText: "6 months" })).not.toBeVisible();
		const sixMonthsOtherAssets = page.locator('.table__tr:nth-child(3) .table__td:nth-child(4) .tableValue', { hasText: "-3.2%" })
		await expect(sixMonthsOtherAssets).toBeVisible();
		await expect(sixMonthsOtherAssets).toHaveAttribute("title", "From $54,750.00")

		await expect(page.locator('.table__sortable--active', { hasText: "Year to date" })).not.toBeVisible();
		// const debtYearToDate = page.locator('.table__tr:nth-child(5) .table__td:nth-child(5) .tableValue', { hasText: "-39%" })
		const debtYearToDate = page.locator('.table__tr:nth-child(4) .table__td:nth-child(5) .tableValue', { hasText: "-24%" })
		await expect(debtYearToDate).toBeVisible();
		await expect(debtYearToDate).toHaveAttribute("title", "From -$27,363.62")

		await expect(page.locator('.table__sortable--active', { hasText: "1 year" })).not.toBeVisible();
		// const cashOneYear = page.locator('.table__tr:nth-child(5) .table__td:nth-child(6) .tableValue', { hasText: "+197%" })
		const cashOneYear = page.locator('.table__tr:nth-child(5) .table__td:nth-child(6) .tableValue', { hasText: "+100%" })
		await expect(cashOneYear).toBeVisible();
		await expect(cashOneYear).toHaveAttribute("title", "From $5,350.00")

		await expect(page.locator('.table__sortable--active', { hasText: "5 years" })).not.toBeVisible();
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(7)', { hasText: "~" })).toBeVisible();

		await expect(page.locator('.table__sortable--active', { hasText: "Max" })).not.toBeVisible();
		const maxNetWorth = page.locator('.table__tr:nth-child(1) .table__td:nth-child(8) .tableValue--positive', { hasText: "+1,382%" })
		await expect(maxNetWorth).toBeVisible();
		await expect(maxNetWorth).toHaveAttribute("title", "From $12,535.61")

		// const maxDebt = page.locator('.table__tr:nth-child(4) .table__td:nth-child(8) .tableValue--negative', { hasText: "+7,300%" })
		const maxDebt = page.locator('.table__tr:nth-child(4) .table__td:nth-child(8) .tableValue--negative', { hasText: "+3,626%" })
		await expect(maxDebt).toBeVisible();
		await expect(maxDebt).toHaveAttribute("title", "From -$558.58")

		await expect(page.locator('.table__sortable--active', { hasText: "Allocation" })).toBeVisible();

		const allocationNetWorth = page.locator('.tableValue--excluded', { hasText: "100%" })
		await expect(allocationNetWorth).toBeVisible();
		await expect(allocationNetWorth).toHaveAttribute("title", "$185,719.09")

		const allocationInvesments = page.locator('.tableValue--numeric', { hasText: "76.9%" })
		await expect(allocationInvesments).toBeVisible();
		await expect(allocationInvesments).toHaveAttribute("title", "$142,831.36")
		await expect(page.locator('.tableValue--numeric', { hasText: "-76.9%" })).not.toBeVisible();

		await expect(page.locator('.table__tr:nth-child(3) .tableValue--positive', { hasText: "0%" })).not.toBeVisible();
		await expect(page.locator('.table__tr:nth-child(3) .tableValue--negative', { hasText: "0%" })).not.toBeVisible();
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(9)', { hasText: "100%" })).toBeVisible();
		await expect(page.locator('.table__tr:nth-child(5) .table__td:nth-child(9)', { hasText: "5.76%" })).toBeVisible();

		await page.locator('button', { hasText: 'Allocation' }).click();
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(9)', { hasText: "5.76%" })).toBeVisible();
		await expect(page.locator('.table__tr:nth-child(5) .table__td:nth-child(9) .tableValue--excluded', { hasText: "100%" })).toBeVisible(); // prettier-ignore
	});
});
