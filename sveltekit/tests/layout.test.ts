import { expect, test } from '@playwright/test';
import { delay, setEnvironmentVariable } from './fixtures/helpers.js';

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
		await expect(page.locator('button.layout__tag', { hasText: '0.0.0-test' })).toBeVisible();
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

	test.describe('It checks for updates', () => {
		test.afterEach(async ({ baseURL }) => {
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', '0.0.0-test');
		});

		test('Every 3 days', async ({ baseURL, page }) => {
			const context = page.context();
			let storage = await context.storageState();
			expect(storage.origins[0]?.localStorage[0]).toBeUndefined();

			// Set `lastUpdateCheck` to 4 days ago as a number of seconds
			const FOUR_DAYS_IN_SECONDS = 345600;
			const lastUpdateCheck = (Math.floor(Date.now() / 1000) - FOUR_DAYS_IN_SECONDS).toString();

			// Update localStorage
			storage.origins.push({
				origin: baseURL!,
				localStorage: [
					{
						name: 'lastUpdateCheck',
						value: lastUpdateCheck
					}
				]
			});

			// Check the initial `lastUpdateCheck` is set correctly
			let currentLocalStorage = storage.origins[0]?.localStorage[0];
			expect(currentLocalStorage).toStrictEqual({
				name: 'lastUpdateCheck',
				value: lastUpdateCheck
			});
			expect(currentLocalStorage).not.toBeUndefined();
			expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
			expect(JSON.stringify(currentLocalStorage)).toMatch(lastUpdateCheck);

			await page.goto('/');
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

			const currentVersionTag = page.locator('button.layout__tag');
			expect(await currentVersionTag.textContent()).toMatch('0.0.0-test');

			// It should have checked for updates
			storage = await page.context().storageState();
			currentLocalStorage = storage.origins[0]?.localStorage[0];
			const statusBar = page.locator('.statusBar');
			await expect(statusBar).toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).toMatch('A newer version is available');

			// It should have updated the `lastUpdateCheck` date
			storage = await page.context().storageState();
			currentLocalStorage = storage.origins[0]?.localStorage[0];
			expect(currentLocalStorage).not.toBeUndefined();
			expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
			expect(JSON.stringify(currentLocalStorage)).not.toMatch(lastUpdateCheck);
			expect(parseInt(currentLocalStorage.value)).toBeGreaterThanOrEqual(
				parseInt(lastUpdateCheck) + FOUR_DAYS_IN_SECONDS
			);
		});

		test('On user request', async ({ baseURL, page }) => {
			const context = page.context();
			let storage = await context.storageState();
			const currentTime = (Date.now() / 1000).toString();

			// Set localStorage as if updates were recently checked for
			storage.origins.push({
				origin: baseURL!,
				localStorage: [
					{
						name: 'lastUpdateCheck',
						value: currentTime
					}
				]
			});
			let currentLocalStorage = storage.origins[0]?.localStorage[0];
			expect(currentLocalStorage).not.toBeUndefined();
			expect(currentLocalStorage.value).toBe(currentTime);

			await page.goto('/');
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

			const statusBar = page.locator('.statusBar');
			const currentVersionTag = page.locator('button.layout__tag');
			await expect(statusBar).not.toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).not.toMatch('A newer version is available');
			expect(await currentVersionTag.textContent()).toMatch('0.0.0-test');

			// Check for updates
			await currentVersionTag.click();
			await expect(statusBar).toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).toMatch('A newer version is available');

			storage = await context.storageState();
			currentLocalStorage = storage.origins[0]?.localStorage[0];
			expect(currentLocalStorage).not.toBeUndefined();
			expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
			expect(currentLocalStorage.value).not.toBe(currentTime);

			// Set a new version that's higher than the latest one on GitHub
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', '4.2.0-next.69');
			await page.reload();
			expect(await currentVersionTag.textContent()).toMatch('4.2.0-next.69');

			await currentVersionTag.click();
			// This may break if the latest version is ever above 4.2.0 :)
			await expect(statusBar).toHaveClass(/statusBar--positive/);
			expect(await statusBar.textContent()).toMatch('The current version is the latest');

			// Set it to a wrongly-formatted version to cause an error
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', 'not-semver');
			await page.reload();
			expect(await currentVersionTag.textContent()).toMatch('not-semver');

			await currentVersionTag.click();
			await expect(statusBar).toHaveClass(/statusBar--warning/);
			expect(await statusBar.textContent()).toMatch(
				'There was a problem checking for updates, try again later'
			);
		});
	});

	test("When it's offline", async ({ baseURL, page }) => {
		const context = page.context();
		let storage = await context.storageState();
		const currentTime = (Date.now() / 1000).toString();

		// Set localStorage as if updates were recently checked for
		storage.origins.push({
			origin: baseURL!,
			localStorage: [
				{
					name: 'lastUpdateCheck',
					value: currentTime
				}
			]
		});
		let currentLocalStorage = storage.origins[0]?.localStorage[0];
		expect(currentLocalStorage).not.toBeUndefined();
		expect(currentLocalStorage.value).toBe(currentTime);

		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const currentVersionTag = page.locator('button.layout__tag');
		expect(await currentVersionTag.textContent()).toMatch('0.0.0-test');

		// Set the app offline and trigger an update check
		await context.setOffline(true);

		// HACK: Check the app is indeed offline
		try {
			// Try to navigate to another page to trigger a `net::ERR_INTERNET_DISCONNECTED` error
			await page.goto('/balanceSheet');
		} catch (_e) {
			// Going back to the previous page which should still be cached
			await page.goBack();
		}

		await currentVersionTag.click();
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).toHaveClass(/statusBar--warning/);
		expect(await statusBar.textContent()).toMatch(
			'There was a problem checking for updates, try again later'
		);

		storage = await context.storageState();
		currentLocalStorage = storage.origins[0]?.localStorage[0];
		expect(currentLocalStorage).not.toBeUndefined();
		expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
	});
});
