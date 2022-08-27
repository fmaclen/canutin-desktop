import { expect, test } from '@playwright/test';

test.describe('Layout', () => {
	test('Sidebar renders correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const sidebarBigPicture = page.locator('a', { hasText: 'The big picture' });
		await expect(sidebarBigPicture).toHaveAttribute('href', '/');
		await expect(sidebarBigPicture).toHaveClass(/layout__a--active/);

		const sidebarBalanceSheet = page.locator('a:has-text("Balance sheet")');
		await expect(sidebarBalanceSheet).toHaveAttribute('href', '/balanceSheet');
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);

		await sidebarBalanceSheet.click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(sidebarBigPicture).not.toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a--active/);

		const sidebarImportData = page.locator('a', { hasText: 'Import data' });
		await expect(sidebarImportData).toHaveAttribute('href', '/import');
		await expect(sidebarImportData).toHaveClass(/layout__a/);
		await expect(sidebarImportData).not.toHaveClass(/layout__a--active/);

		await sidebarImportData.click();
		await expect(page.locator('h1', { hasText: 'Import data' })).toBeVisible();
		await expect(sidebarImportData).toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);
	});

	test('Default settings are rendered correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'USD $' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'English' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: '0.0.0' })).toBeVisible();
	});

	test('Error pages', async ({ page }) => {
		// Error 404
		await page.goto('/not-found');
		await expect(page.locator('h1', { hasText: 'Not found' })).toBeVisible();
		await expect(await page.locator('p.notice').textContent()).toMatch(
			"No content found. Perhaps there's a typo in the address or followed a broken link"
		);
		await expect(await page.locator('p.errorMessage')).not.toBeVisible();

		// Error 500
		// This tests runs against the production build so we can't trigger a internal
		// server error but in `dev` we can by visiting `/500` which intercetps what
		// would have been a 404 and throws an intentional error.
		//
		// The test below is running negative assertions against a 404 to make sure
		// an error 500 can't occur by visiting `/500` in production.
		await page.goto('/500');
		await expect(page.locator('h1', { hasText: 'Something went wrong' })).not.toBeVisible();
		await expect(await page.locator('p.notice').textContent()).not.toMatch(
			"An error ocurred and whatever was happening likely didn't finish succesfully"
		);
		await expect(
			await page.locator('p.errorMessage', {
				hasText:
					'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
			})
		).not.toBeVisible();
	});
});
