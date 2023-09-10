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
		await page.locator('a', { hasText: 'Accounts' }).click();
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		await page.locator('a', { hasText: 'Assets' }).click();
		await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
		await page.locator('a', { hasText: 'Trends' }).click();
		await expect(page.locator('h1', { hasText: 'Trends' })).toBeVisible();
		await expect(page.locator('.tableValue')).toHaveCount(35);
		await expect(page.locator('.table__sortable--active', { hasText: "1 week" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(2)', { hasText: "+9.5%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "1 month" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(2) .table__td:nth-child(3)', { hasText: "+8.88%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "6 months" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(3) .table__td:nth-child(4)', { hasText: "-3.2%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "Year to date" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(4) .table__td:nth-child(5)', { hasText: "-44%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "1 year" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(5) .table__td:nth-child(6)', { hasText: "+147%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "5 years" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(7)', { hasText: "~" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "Max" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(8) .tableValue--positive', { hasText: "+1,378%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(4) .table__td:nth-child(8) .tableValue--negative', { hasText: "+10,985%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__sortable--active', { hasText: "Allocation" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.tableValue--excluded', { hasText: "100%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.tableValue--numeric', { hasText: "77.1%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.tableValue--numeric', { hasText: "-77.1%" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(3) .tableValue--positive', { hasText: "0%" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(3) .tableValue--negative', { hasText: "0%" })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(9)', { hasText: "100%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(5) .table__td:nth-child(9)', { hasText: "4.80%" })).toBeVisible(); // prettier-ignore

		await page.locator('button', { hasText: 'Allocation' }).click();
		await expect(page.locator('.table__tr:nth-child(1) .table__td:nth-child(9)', { hasText: "4.80%" })).toBeVisible(); // prettier-ignore
		await expect(page.locator('.table__tr:nth-child(5) .table__td:nth-child(9) .tableValue--excluded', { hasText: "100%" })).toBeVisible(); // prettier-ignore
	});
});
