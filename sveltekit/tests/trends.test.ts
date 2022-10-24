import { expect, test } from '@playwright/test';
import { databaseWipe, databaseSeed } from './fixtures/helpers.js';

test.describe('Trends', () => {
	test('Charts are rendered correctly', async ({ page, baseURL }) => {
		await databaseWipe(baseURL!);
		await databaseSeed(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Trends' }).click();
		await expect(page.locator('h1', { hasText: 'Trends' })).toBeVisible();

		const MAX_DIFF_PIXELS = 256;
		const charts = page.locator('.chart canvas');
		expect(await charts.count()).toBe(5);
		expect(await charts.nth(0).screenshot()).toMatchSnapshot({
			name: 'chart-netWorth.png',
			maxDiffPixels: MAX_DIFF_PIXELS
		});
		expect(await charts.nth(1).screenshot()).toMatchSnapshot({
			name: 'chart-cash.png',
			maxDiffPixels: MAX_DIFF_PIXELS
		});
		expect(await charts.nth(2).screenshot()).toMatchSnapshot({
			name: 'chart-debt.png',
			maxDiffPixels: MAX_DIFF_PIXELS
		});
		expect(await charts.nth(3).screenshot()).toMatchSnapshot({
			name: 'chart-investments.png',
			maxDiffPixels: MAX_DIFF_PIXELS
		});
		expect(await charts.nth(4).screenshot()).toMatchSnapshot({
			name: 'chart-otherAssets.png',
			maxDiffPixels: MAX_DIFF_PIXELS
		});
	});
});
