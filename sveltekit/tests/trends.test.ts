import { expect, test } from '@playwright/test';
import { databaseWipe, databaseSeed } from './fixtures/helpers.js';

test.describe('Trends', () => {
	test('Charts are rendered correctly', async ({ page, baseURL }, testInfo) => {
		// NOTE: Our current testing setup runs on Windows, Linux and MacOS.
		// On each OS we also run the tests in Chromium, Firefox and Webkit.
		// To run pixel perfect visual regression tests we would need dedicated snapshots
		// for each OS and browser combination so to simplify things we use the macOS + Chromium
		// snapshot as the source and allow the other scenarios to have a 5% pixel variance:
		const MAX_DIFF_PIXEL_RATIO = 0.05;

		// Playwright renames snapshots to match the current OS and browser, so we need to
		// update the test configuration so it always matches the macOS + Chromium snapshot.
		// REF: https://github.com/microsoft/playwright/issues/7575#issuecomment-1240566545
		testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;

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
