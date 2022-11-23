import { expect, test } from '@playwright/test';
import { delay, setEnvironmentVariable } from './fixtures/helpers.js';

test.describe('Layout', () => {
	test('Sidebar renders correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const sidebarBigPicture = page.locator('.layout__aside a', { hasText: 'The big picture' });
		await expect(sidebarBigPicture).toHaveAttribute('href', '/');
		await expect(sidebarBigPicture).toHaveClass(/layout__a--active/);

		const sidebarBalanceSheet = page.locator('.layout__aside a', { hasText: 'Balance sheet' });
		await expect(sidebarBalanceSheet).toHaveAttribute('href', '/balanceSheet');
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);

		await sidebarBalanceSheet.click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(sidebarBigPicture).not.toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a--active/);

		const sidebarAddOrUpdateData = page.locator('.layout__aside a', {
			hasText: 'Add or update data'
		});
		await expect(sidebarAddOrUpdateData).toHaveAttribute('href', '/data');
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a/);
		await expect(sidebarAddOrUpdateData).not.toHaveClass(/layout__a--active/);

		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add or update data' })).toBeVisible();
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);

		const sidebarSettings = page.locator('.layout__aside a', {
			hasText: 'Settings'
		});
		await expect(sidebarSettings).toHaveAttribute('href', '/settings');
		await expect(sidebarSettings).toHaveClass(/layout__a/);
		await expect(sidebarSettings).not.toHaveClass(/layout__a--active/);

		await sidebarSettings.click();
		await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible();
		await expect(sidebarSettings).toHaveClass(/layout__a--active/);
		await expect(sidebarAddOrUpdateData).not.toHaveClass(/layout__a--active/);

		const titleBar = page.locator('.layout__title-bar');
		const calendarClock = (await titleBar.textContent()) || '';
		const todayFormatted = new Date().toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
		expect(calendarClock).toMatch(todayFormatted);
		await delay(1000);
		expect(await titleBar.textContent()).not.toMatch(calendarClock);
	});

	test('Default settings are rendered correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page.locator('button.buttonTag', { hasText: 'USD $' })).toBeVisible();
		await expect(page.locator('button.buttonTag', { hasText: 'USD $' })).toBeDisabled();
		await expect(page.locator('button.buttonTag', { hasText: 'English' })).toBeVisible();
		await expect(page.locator('button.buttonTag', { hasText: 'English' })).toBeDisabled();
		await expect(page.locator('button.buttonTag', { hasText: 'v0.0.0-test' })).toBeVisible();
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
		const sidebarAddOrUpdateData = page.locator('.layout__aside a', {
			hasText: 'Add or update data'
		});
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		// Add or update data
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add or update data' })).toBeVisible();

		// Sync CanutinFile
		const linkSyncSettings = page.locator('a', { hasText: 'Sync' });
		await expect(linkSyncSettings).toHaveAttribute('href', '/settings');

		await linkSyncSettings.click();
		await expect(page.locator('h1', { hasText: 'Settings' })).toBeVisible();

		// Import CanutinFile
		await sidebarAddOrUpdateData.click();
		const linkImportFile = page.locator('a', { hasText: 'Import file' });
		await expect(linkImportFile).toHaveAttribute('href', '/import');

		await linkImportFile.click();
		await expect(page.locator('h1', { hasText: 'Import CanutinFile' })).toBeVisible();

		// Add account
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Account' })).not.toBeVisible();
		await expect(page.locator('a.wizard__a', { hasText: 'Account' })).toHaveAttribute(
			'href',
			'/account/add'
		);

		await page.locator('a.wizard__a', { hasText: 'Account' }).click();
		await expect(page.locator('h1', { hasText: 'Account' })).toBeVisible();

		// Add Asset
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Asset' })).not.toBeVisible();
		await expect(page.locator('a.wizard__a', { hasText: 'Asset' })).toHaveAttribute(
			'href',
			'/asset/add'
		);

		await page.locator('a.wizard__a', { hasText: 'Asset' }).click();
		await expect(page.locator('h1', { hasText: 'Asset' })).toBeVisible();

		// Add transaction
		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Transaction' })).not.toBeVisible();
		await expect(page.locator('a.wizard__a', { hasText: 'Transaction' })).toHaveAttribute(
			'href',
			'/transaction/add'
		);

		await page.locator('a.wizard__a', { hasText: 'Transaction' }).click();
		await expect(page.locator('h1', { hasText: 'Transaction' })).toBeVisible();
	});

	test('Status bar with positive notices auto-dismiss', async ({ page }) => {
		await page.goto('/');
		await page
			.locator('.layout__aside a', {
				hasText: 'Add or update data'
			})
			.click();
		await page.locator('a.wizard__a', { hasText: 'Account' }).click();

		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);

		await page.locator('.formInput__input[name=name]').fill("Bob's Test Account");
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('The account was added successfully');

		// Wait for 7 seconds to make sure the notice auto-dismisses
		await delay(7000);
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('The account was added successfully');
	});

	test.describe('Checks for app updates', () => {
		test.afterEach(async ({ baseURL }) => {
			// Reset APP_VERSION to the default value
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', 'v0.0.0-test');
		});

		test('Automatically every 3 days', async ({ baseURL, browser }) => {
			// Set `lastUpdateCheck` to 4 days ago as a number of seconds
			const FOUR_DAYS_IN_SECONDS = 345600;
			const fourDaysAgo = (Math.floor(Date.now() / 1000) - FOUR_DAYS_IN_SECONDS).toString();
			const context = await browser.newContext({
				storageState: {
					cookies: [],
					origins: [
						{
							origin: baseURL!,
							localStorage: [
								{
									name: 'lastUpdateCheck',
									value: fourDaysAgo
								}
							]
						}
					]
				}
			});
			const page = await context.newPage();
			let storage = await page.context().storageState();
			let lastUpdateCheck = storage.origins[0]?.localStorage[0];
			expect(JSON.stringify(lastUpdateCheck)).toMatch('lastUpdateCheck');
			expect(JSON.stringify(lastUpdateCheck)).toMatch(fourDaysAgo);

			await page.goto('/');
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

			const currentVersionTag = page.locator('button.buttonTag', { hasText: 'v0.0.0-test' });
			await expect(currentVersionTag).toBeVisible();

			// It should have checked for updates
			const statusBar = page.locator('.statusBar');
			await expect(statusBar).toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).toMatch('A newer version is available');

			// It should have updated the `lastUpdateCheck` date
			storage = await page.context().storageState();
			lastUpdateCheck = storage.origins[0]?.localStorage[0];
			expect(lastUpdateCheck).not.toBeUndefined();
			expect(JSON.stringify(lastUpdateCheck)).toMatch('lastUpdateCheck');
			expect(JSON.stringify(lastUpdateCheck)).not.toMatch(fourDaysAgo);
			expect(parseInt(lastUpdateCheck.value)).toBeGreaterThanOrEqual(
				parseInt(fourDaysAgo) + FOUR_DAYS_IN_SECONDS
			);
		});

		test('Upon user request', async ({ baseURL, page, context }) => {
			await page.goto('/');
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
			const statusBar = page.locator('.statusBar');
			let currentVersionTag = page.locator('button.buttonTag', { hasText: 'v0.0.0-test' });
			await expect(statusBar).not.toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).not.toMatch('A newer version is available');
			await expect(currentVersionTag).toBeVisible();

			// Check for updates
			let storage = await context.storageState();
			let lastUpdateCheck = storage.origins[0]?.localStorage[0];
			const originalLastUpdateCheck = lastUpdateCheck?.value;
			await currentVersionTag.click();
			await expect(statusBar).toHaveClass(/statusBar--active/);
			expect(await statusBar.textContent()).toMatch('A newer version is available');

			storage = await context.storageState();
			lastUpdateCheck = storage.origins[0]?.localStorage[0];
			expect(JSON.stringify(lastUpdateCheck)).toMatch('lastUpdateCheck');
			expect(lastUpdateCheck.value).not.toBe(originalLastUpdateCheck);

			// Set a new version that's higher than the latest one on GitHub
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', 'v4.2.0-next.69');
			await page.reload();
			currentVersionTag = page.locator('button.buttonTag', { hasText: 'v4.2.0-next.69' });
			await expect(currentVersionTag).toBeVisible();

			await currentVersionTag.click();
			// This may break if the latest version is ever above 4.2.0 :)
			await expect(statusBar).toHaveClass(/statusBar--positive/);
			expect(await statusBar.textContent()).toMatch('The current version is the latest');

			// Set it to a wrongly-formatted version to cause an error
			await setEnvironmentVariable(baseURL!, 'APP_VERSION', 'not-semver');
			await page.reload();
			currentVersionTag = page.locator('button.buttonTag', { hasText: 'not-semver' });
			await expect(currentVersionTag).toBeVisible();

			await currentVersionTag.click();
			await expect(statusBar).toHaveClass(/statusBar--warning/);
			expect(await statusBar.textContent()).toMatch(
				'There was a problem checking for updates, try again later'
			);
		});
	});

	test("When it's offline", async ({ page, context }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const currentVersionTag = page.locator('button.buttonTag', { hasText: 'v0.0.0-test' });
		await expect(currentVersionTag).toBeVisible();

		// Set the app offline and trigger an update check
		await context.setOffline(true);
		await delay();
		await currentVersionTag.click();
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).toHaveClass(/statusBar--warning/);
		expect(await statusBar.textContent()).toMatch(
			'There was a problem checking for updates, try again later'
		);

		const storage = await context.storageState();
		const currentLocalStorage = storage.origins[0]?.localStorage[0];
		expect(currentLocalStorage).not.toBeUndefined();
		expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
	});
});
