import { expect, test } from '@playwright/test';
import { Appearance, DeveloperFunctions } from '../src/lib/helpers/constants.js';
import {
	databaseSeed,
	databaseWipe,
	delay,
	expectToastAndDismiss,
	prepareToAcceptDialog,
	setEnvironmentVariable
} from './fixtures/helpers.js';

test.describe('Developer tools', () => {
	// FIXME: this test fails in CI, probably due to a race condition
	if (process.env.NODE_ENV !== 'CI') {
		test.beforeAll(async ({ baseURL }) => {
			await setEnvironmentVariable(baseURL!, 'TEST_DEV_TOOLS', 'true');
		});

		test.afterAll(async ({ baseURL }) => {
			await setEnvironmentVariable(baseURL!, 'TEST_DEV_TOOLS', 'false');
		});

		test.beforeEach(async ({ baseURL, page }) => {
			await databaseWipe(baseURL!);
			await page.goto('/');
			await expectToastAndDismiss(page, 'Database was wiped successfully', Appearance.ACTIVE);
		});

		test('Sidebar link is not visible in production', async ({ page }) => {
			await page.goto('/');
			await expect(page.locator('a', { hasText: 'The big picture' })).toBeVisible();
			await expect(page.locator('a', { hasText: 'Developer tools' })).not.toBeVisible();
		});

		test('Seed data, then delete accounts, transactions & assets', async ({ page }) => {
			await page.goto('/');
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

			await page.goto('/devTools');
			await expect(page.locator('h1', { hasText: 'Developer tools' })).toBeVisible();

			// Seed DB
			await page.locator('button', { hasText: 'Seed demo data' }).click();
			await expectToastAndDismiss(page, 'Database was seeded successfully', Appearance.POSITIVE);

			await page.goto('/');
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch(
				'$185,719'
			);

			// Seeding again without deleting data should fail
			await page.goto('/devTools');
			await page.locator('button', { hasText: 'Seed demo data' }).click();
			await expectToastAndDismiss(page, 'Database could not be seeded', Appearance.NEGATIVE);

			// Delete all accounts and assets
			await prepareToAcceptDialog(page, 'Are you sure you want to continue?');

			await page.locator('button', { hasText: 'Delete accounts, transactions & assets' }).click();
			await expectToastAndDismiss(page, 'All accounts, transactions & assets have been deleted', Appearance.ACTIVE); // prettier-ignore

			await page.goto('/');
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');
		});

		test('Delete only transactions', async ({ baseURL, page }) => {
			await databaseSeed(baseURL!);

			await page.goto('/');
			await expectToastAndDismiss(page, 'Database was seeded successfully', Appearance.POSITIVE); // prettier-ignore

			await page.locator('a', { hasText: 'Transactions' }).click();
			await delay();
			expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('111');

			// Delete all Transactions
			await page.goto('/devTools');
			await prepareToAcceptDialog(page, 'Are you sure you want to continue?');

			await page.locator('button', { hasText: 'Delete transactions only' }).click();
			await expectToastAndDismiss(page, 'All transactions have been deleted', Appearance.ACTIVE); // prettier-ignore

			await page.goto('/transactions');
			await delay();
			expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('0');
		});

		test('Deleting all data including settings and events', async ({ baseURL, page }) => {
			await page.goto('/');
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

			const sidebarSyncButton = page.locator('button', { hasText: 'Sync' });
			await expect(sidebarSyncButton).not.toBeVisible();

			// Enable sync
			await page.locator('a', { hasText: 'Settings' }).click();

			const urlInput = page.locator('.formInput__input[name=canutinFileUrl]');
			const cookieInput = page.locator('.formInput__input[name=cookie]');
			const jwtInput = page.locator('.formInput__input[name=jwt]');

			await urlInput.fill(
				`${baseURL}/devTools.json?functionType=${DeveloperFunctions.CANUTIN_FILE_SYNC_TEST}`
			);
			await cookieInput.fill('accessToken=1234abc; userId=1234; Path=/; HttpOnly;');
			await jwtInput.fill(
				'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
			);
			await page
				.locator('div[data-test-id=settings-sync-form] button', { hasText: 'Enable' })
				.click();
			await expect(sidebarSyncButton).toBeVisible();

			// Check the server response was imported correctly
			await sidebarSyncButton.click();
			await delay();
			await page.locator('a', { hasText: 'The big picture' }).click();
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch(
				'$80,340'
			);

			// Delete all data
			await page.goto('/devTools');
			await prepareToAcceptDialog(page, 'Are you sure you want to continue?');

			await delay();
			await page.locator('button', { hasText: 'Delete all data' }).click();
			await expectToastAndDismiss(page, 'Database was wiped successfully', Appearance.ACTIVE);

			await page.locator('a', { hasText: 'The big picture' }).click();
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');
			await expect(sidebarSyncButton).not.toBeVisible();
		});
	}
});
