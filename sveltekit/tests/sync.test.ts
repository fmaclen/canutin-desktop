import { DeveloperFunctions } from '../src/lib/helpers/constants.js';
import { expect, test } from '@playwright/test';
import { databaseWipe } from './fixtures/helpers.js';

test.describe('Sync CanutinFile', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('UI is rendered correctly', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(page.locator('section', { hasText: 'Sync' })).toBeVisible();
		const formNotice = page.locator('div[data-test-id=settings-sync-form] .formNotice__notice');
		expect(await formNotice.textContent()).toMatch('Sync is disabled');
		await expect(formNotice).toHaveClass(/formNotice__notice--warning/);

		const submitButton = page.locator('div[data-test-id=settings-sync-form] button', {
			hasText: 'Enable'
		});
		const urlInput = page.locator('.formInput__input[name=canutinFileUrl]');
		await expect(urlInput).toHaveValue('');
		await expect(submitButton).toBeDisabled();

		await urlInput.fill('http://myscraper.example.com/canutinFile.json');
		await expect(submitButton).not.toBeDisabled();
		await expect(page.locator('button', { hasText: 'Sync' })).not.toBeVisible();
	});

	test('Fetching a CanutinFile from a url', async ({ page, baseURL }) => {
		// Check the vault is empty
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

		// Check there is no Sync button in the sidebar
		const sidebarSyncButton = page.locator('button', { hasText: 'Sync' });
		await expect(sidebarSyncButton).not.toBeVisible();

		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(page.locator('section', { hasText: 'Sync' })).toBeVisible();
		await expect(sidebarSyncButton).not.toBeVisible();

		const urlInput = page.locator('.formInput__input[name=canutinFileUrl]');
		const cookieInput = page.locator('.formInput__input[name=cookie]');
		const jwtInput = page.locator('.formInput__input[name=jwt]');
		let submitButton = page.locator('div[data-test-id=settings-sync-form] button', {
			hasText: 'Enable'
		});

		await expect(cookieInput).toHaveAttribute('type', 'password');
		await expect(jwtInput).toHaveAttribute('type', 'password');

		// This endpoint will return `tests/fixtures/canutinFile-maximum-data.json` as a response
		await urlInput.fill(
			`${baseURL}/devTools.json?functionType=${DeveloperFunctions.CANUTIN_FILE_SYNC_TEST}`
		);
		await expect(submitButton).not.toBeDisabled();

		// Submit form with only a URL when the server expects a cookie and JWT
		await submitButton.click();
		expect(await page.locator('.statusBar--warning').textContent()).toMatch(
			"Coudn't fetch a CanutinFile JSON from the provided URL"
		);

		// Submit form with only a cookie
		await cookieInput.fill('accessToken=1234abc; userId=1234; Path=/; HttpOnly;');
		await submitButton.click();
		expect(await page.locator('.statusBar--warning').textContent()).toMatch(
			"Coudn't fetch a CanutinFile JSON from the provided URL"
		);

		// Submit form with a JWT
		await jwtInput.fill(
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
		);
		await submitButton.click();
		expect(await page.locator('.statusBar--positive').textContent()).toMatch(
			'Sync was enabled succesfully'
		);

		// Check the notice has changed
		const formNotice = page.locator('div[data-test-id=settings-sync-form] .formNotice__notice');
		expect(await formNotice.textContent()).toMatch('Sync is enabled');
		await expect(formNotice).toHaveClass(/formNotice__notice--positive/);

		// Check the label of the submit form button has changed
		submitButton = page.locator('button', { hasText: 'Update' });
		await expect(submitButton).not.toBeDisabled();

		// Clear the url field to disable the submit button
		await urlInput.fill('');
		await expect(submitButton).toBeDisabled();

		// Check the sidebar has a Sync button
		await expect(sidebarSyncButton).toBeVisible();

		await page.reload();
		await expect(sidebarSyncButton).toBeVisible();

		// Trigger a sync
		await sidebarSyncButton.click();
		await expect(sidebarSyncButton).toBeDisabled();
		expect(await page.locator('.statusBar--active').textContent()).toMatch('Syncing...');
		expect(await page.locator('.statusBar--positive').textContent()).toMatch(
			'Sync updated 2 accounts and 2 assets'
		);
		await expect(sidebarSyncButton).not.toBeDisabled();

		// Check the server response was imported correctly
		await page.locator('a', { hasText: 'The big picture' }).click();
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$80,340');

		// Disable sync by entering server information that doesn't return a response
		await page.locator('a', { hasText: 'Settings' }).click();
		await urlInput.fill(`${baseURL}/nonExistentEndpoint.json`);
		await submitButton.click();

		await expect(formNotice).toHaveClass(/formNotice__notice--warning/);
		expect(await formNotice.textContent()).toMatch('Sync is disabled');
		await expect(sidebarSyncButton).toBeVisible();
		await expect(sidebarSyncButton).toBeDisabled();
	});
});
