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
});
