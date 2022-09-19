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

		const sidebarAddOrUpdateData = page.locator('a', { hasText: 'Add or update data' });
		await expect(sidebarAddOrUpdateData).toHaveAttribute('href', '/data');
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a/);
		await expect(sidebarAddOrUpdateData).not.toHaveClass(/layout__a--active/);

		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add or update data' })).toBeVisible();
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);
	});

	test('Default settings are rendered correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'USD $' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'English' })).toBeVisible();
		await expect(page.locator('button.layout__tag', { hasText: '4.2.0-next.69' })).toBeVisible(); // `APP_VERSION` is set in `playwright.config.ts`
	});

	test('Error pages', async ({ page }) => {
		// Error 404
		await page.goto('/not-found');
		await expect(page.locator('h1', { hasText: 'Not found' })).toBeVisible();
		expect(await page.locator('p.notice').textContent()).toMatch(
			"No content found. Perhaps there's a typo in the address or followed a broken link"
		);
		await expect(page.locator('p.errorMessage')).not.toBeVisible();

		// Error 500
		// This tests runs against the production build so we can't trigger a internal
		// server error but in `dev` we can by visiting `/500` which intercetps what
		// would have been a 404 and throws an intentional error.
		//
		// The test below is running negative assertions against a 404 to make sure
		// an error 500 can't occur by visiting `/500` in production.
		await page.goto('/500');
		await expect(page.locator('h1', { hasText: 'Something went wrong' })).not.toBeVisible();
		expect(await page.locator('p.notice').textContent()).not.toMatch(
			"An error ocurred and whatever was happening likely didn't finish succesfully"
		);
		await expect(
			page.locator('p.errorMessage', {
				hasText:
					'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
			})
		).not.toBeVisible();
	});

	test('Add or update data section is rendered correctly', async ({ page }) => {
		const sidebarAddOrUpdateData = page.locator('a', { hasText: 'Add or update data' });
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		// Add or update data
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add or update data' })).toBeVisible();

		// Import CanutinFile
		await page.locator('a', { hasText: 'Import CanutinFile' }).click();
		await expect(sidebarAddOrUpdateData).toHaveAttribute('href', '/data');
		await expect(page.locator('h1', { hasText: 'Import CanutinFile' })).toBeVisible();

		// Add account
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add account' })).not.toBeVisible();
		await expect(page.locator('a', { hasText: 'Add account' })).toHaveAttribute(
			'href',
			'/account/add'
		);

		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

		// Add asset
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).not.toBeVisible();
		await expect(page.locator('a', { hasText: 'Add asset' })).toHaveAttribute('href', '/asset/add');

		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

		// Add transaction
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add transaction' })).not.toBeVisible();
		await expect(page.locator('a', { hasText: 'Add transaction' })).toHaveAttribute(
			'href',
			'/transaction/add'
		);

		await page.locator('a', { hasText: 'Add transaction' }).click();
		await expect(page.locator('h1', { hasText: 'Add transaction' })).toBeVisible();
	});
});
