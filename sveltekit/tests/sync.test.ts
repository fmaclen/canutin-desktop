import fs from 'fs';
import fetch from 'node-fetch';
import { expect, test } from '@playwright/test';
import { databaseWipe, delay } from './fixtures/helpers.js';

test.describe('Sync CanutinFile', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('UI is rendered correctly', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(page.locator('section', { hasText: 'Sync' })).toBeVisible();
		await expect(
			page.locator('.formNotice__notice', { hasText: 'Sync is disabled' })
		).toBeVisible();

		const urlInput = page.locator('.formInput__input[name=canutinFileUrl]');
		await expect(urlInput).toHaveValue('');
		await expect(page.locator('button', { hasText: 'Enable' })).toBeDisabled();

		await urlInput.fill('http://myscraper.example.com/canutinFile.json');
		await expect(page.locator('button', { hasText: 'Enable' })).not.toBeDisabled();
		await expect(page.locator('a', { hasText: 'Sync' })).not.toBeVisible();
	});

	test.skip('Fetching a CanutinFile from a url', async ({ page, baseURL }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(page.locator('section', { hasText: 'Sync' })).toBeVisible();

		// client: check sync button on sidebar **is invisible**
		// client: refresh page and check sync button on sidebar **is still invisible**
		// client: set url (perhaps as /devTools.json)
		// client: set cookie
		// client: set jwt
		// server: check the received request is correct
		// client: check sync is enabled
		// client: check sync button on sidebar is enabled
		// client: refresh page and check that sync is still enabled
		// client: click sync button
		// server: check the received request is correct
		// client: check a success message is shown in the status bar
		// client: set an incorrect url
		// client: check sync button on sidebar **is visible** and is disabled // NEED TO IMPLEMENT THIS FIRST
		// client: check status bar shows a warning message
		// client: refresh page and check that sync **is still visible** and is disabled
	});
});
