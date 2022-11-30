import { expect, test } from '@playwright/test';
import { databaseWipe, delay, setEnvironmentVariable } from './fixtures/helpers.js';

test.describe('Access key', () => {
	const fakeAccessKey = 'top-secret-key-123';

	test('Access to UI can be restricted by setting an access key', async ({ baseURL, page }) => {
		await databaseWipe(baseURL!);

		// Check cookies aren't set
		const context = page.context();
		let cookies = await context.cookies();
		expect(cookies).toHaveLength(0);

		await page.goto('/');
		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(page.locator('section', { hasText: 'Access key' })).toBeVisible();

		const formNotice = page.locator('div[data-test-id=settings-accessKey-form] .formNotice__notice'); // prettier-ignore
		await expect(formNotice).toHaveClass(/formNotice__notice--warning/);
		expect(await formNotice.textContent()).toMatch('Access key is disabled');

		const accessKeyButtons = 'div[data-test-id=settings-accessKey-form] button';
		const submitButton = page.locator(accessKeyButtons, { hasText: 'Enable' });
		const updateButton = page.locator(accessKeyButtons, { hasText: 'Update' });
		const resetButton = page.locator(accessKeyButtons, { hasText: 'Reset' });
		const generateButton = page.locator(accessKeyButtons, { hasText: 'Generate' });
		const copyButton = page.locator(accessKeyButtons, { hasText: 'Copy' });
		const accessKeyInput = page.locator('.formInput__input[name=accessKey]');

		await expect(accessKeyInput).toHaveAttribute('type', 'password');
		await expect(accessKeyInput).toHaveValue('');
		await expect(submitButton).toBeDisabled();
		await expect(resetButton).toBeDisabled();
		await expect(updateButton).not.toBeVisible();
		await expect(generateButton).not.toBeDisabled();
		await expect(copyButton).not.toBeVisible();

		// Check the UI is updated when an access key is filled in
		await accessKeyInput.fill(fakeAccessKey);
		await expect(submitButton).not.toBeDisabled();
		await expect(resetButton).toBeDisabled();
		await expect(updateButton).not.toBeVisible();
		await expect(generateButton).not.toBeVisible();
		await expect(copyButton).not.toBeDisabled();

		await accessKeyInput.fill('');
		await expect(generateButton).not.toBeDisabled();
		await expect(copyButton).not.toBeVisible();

		// Generate a new access key
		await generateButton.click();
		await expect(generateButton).not.toBeVisible();
		await expect(copyButton).not.toBeDisabled();

		// Check the generated access key matches the expected format (UUID v4)
		// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
		const UUIDv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(await accessKeyInput.inputValue()).toMatch(UUIDv4Regex);

		// Check clipboard is empty
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		let clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toMatch('');

		await copyButton.click();
		clipboard = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboard).toMatch(UUIDv4Regex);

		const statusBar = page.locator('.statusBar');

		// Set access key
		await submitButton.click();
		await expect(updateButton).toBeVisible();
		await expect(resetButton).not.toBeDisabled();
		await expect(submitButton).not.toBeVisible();
		await expect(formNotice).toHaveClass(/formNotice__notice--positive/);
		expect(await formNotice.textContent()).toMatch('Access key is enabled');
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('Access key has been set');

		// Check cookies are set
		cookies = await context.cookies();
		expect(cookies).toHaveLength(1);
		expect(cookies[0].name).toMatch('_canutin-accessKey');
		expect(cookies[0].value).toMatch(clipboard);

		// Check other parts of the UI can be accessed with a cookie set
		await page.locator('a', { hasText: 'The big picture' }).click();
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

		// Remove access key from cookies
		await context.clearCookies();
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).not.toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();

		// Sidebar links should be disabled
		expect(await page.locator('.layout__a--disabled').count()).toBe(8);

		// Manually enter a URL to make check it redirects to the access key page
		await page.goto('/transactions');
		await expect(page.locator('h1', { hasText: 'Transactions' })).not.toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();

		// Enter access key
		const continueButton = page.locator('button', { hasText: 'Continue' });
		await expect(accessKeyInput).toHaveAttribute('type', 'password');
		await expect(accessKeyInput).toHaveValue('');
		await expect(continueButton).toBeDisabled();

		await accessKeyInput.fill(fakeAccessKey);
		await expect(continueButton).not.toBeDisabled();

		// Check access key is incorrect
		await continueButton.click();
		await expect( page.locator('.formInput__error', { hasText: 'Incorrect access key' })).toBeVisible(); // prettier-ignore

		// It reidrects after setting the access key
		await accessKeyInput.fill(clipboard);
		await continueButton.click();
		await expect(page.locator('h1', { hasText: 'Access key' })).not.toBeVisible();
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

		// Check cookies have been set (again)
		cookies = await context.cookies();
		expect(cookies).toHaveLength(1);
		expect(cookies[0].value).toMatch(clipboard);

		// Update access key
		await page.locator('a', { hasText: 'Settings' }).click();
		await accessKeyInput.fill(fakeAccessKey);
		await updateButton.click();

		// Check cookies have been updated and access key is still enabled
		await delay(); // Assertion is faster than the cookie being set
		cookies = await context.cookies();
		expect(cookies).toHaveLength(1);
		expect(cookies[0].value).toMatch(fakeAccessKey);
		await expect(formNotice).toHaveClass(/formNotice__notice--positive/);
		expect(await formNotice.textContent()).toMatch('Access key is enabled');

		// Reset access key
		await page.locator('a', { hasText: 'Settings' }).click();
		await expect(resetButton).not.toBeDisabled();

		// Prepare to confirm the dialog prompt
		page.on('dialog', (dialog) => {
			expect(dialog.message()).toMatch('Are you sure you want to reset the access key?');

			dialog.accept();
		});

		await resetButton.click();
		await expect(formNotice).toHaveClass(/formNotice__notice--warning/);
		expect(await formNotice.textContent()).toMatch('Access key is disabled');

		// Check there is no access key set
		await page.goto('/transactions');
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).not.toBeVisible();
	});

	test.describe('Visiting /accessKey', () => {
		test('When no access key is set', async ({ baseURL, page }) => {
			await databaseWipe(baseURL!);

			// Check no access key is set
			await page.goto('/');
			await page.locator('a', { hasText: 'Settings' }).click();
			const formNotice = page.locator(
				'div[data-test-id=settings-accessKey-form] .formNotice__notice'
			);
			expect(await formNotice.textContent()).toMatch('Access key is disabled');
			await expect(formNotice).toHaveClass(/formNotice__notice--warning/);

			// Check it redirects to "The big picture"
			await page.goto('/accessKey');
			await expect(page.locator('h1', { hasText: 'Access key' })).not.toBeVisible();
			await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		});

		test('When access key is set', async ({ baseURL, page }) => {
			await databaseWipe(baseURL!);

			// Set access key
			await page.goto('/');
			await page.locator('a', { hasText: 'Settings' }).click();
			await page.locator('input[name=accessKey]').fill(fakeAccessKey);
			await page.locator('div[data-test-id=settings-accessKey-form] button', { hasText: 'Enable' }).click(); // prettier-ignore
			const formNotice = page.locator('div[data-test-id=settings-accessKey-form] .formNotice__notice'); // prettier-ignore
			await expect(formNotice).toHaveClass(/formNotice__notice--positive/);
			expect(await formNotice.textContent()).toMatch('Access key is enabled');

			// Check the cookie has been set
			await delay(); // Assertion is faster than the cookie being set
			let cookies = await page.context().cookies();
			expect(cookies).toHaveLength(1);
			expect(cookies[0].value).toMatch(fakeAccessKey);
			await page.locator('a', { hasText: 'The big picture' }).click();
			expect(await page.locator('.card', { hasText: 'Net worth' }).textContent()).toMatch('$0');

			// Check if cookies are reset when visitng /accessKey
			await page.goto('/accessKey');
			await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();
			cookies = await page.context().cookies();
			expect(cookies).toHaveLength(1);
			expect(cookies[0].value).toMatch('');
		});
	});

	test('Visiting /devTools is only accessible in tests when access key is set', async ({
		baseURL,
		page
	}) => {
		await databaseWipe(baseURL!);

		// Go to homepage to initialize the vault
		await page.goto('/');

		// Check default /devTools behavior
		await page.goto('/devTools');
		await expect(page.locator('h1', { hasText: 'Developer tools' })).toBeVisible();

		// Set access key
		const formNotice = page.locator('div[data-test-id=settings-accessKey-form] .formNotice__notice'); // prettier-ignore
		const inputAccessKey = page.locator('input[name=accessKey]');

		await page.locator('a', { hasText: 'Settings' }).click();
		await inputAccessKey.fill(fakeAccessKey);
		await page.locator('div[data-test-id=settings-accessKey-form] button', { hasText: 'Enable' }).click(); // prettier-ignore
		await expect(formNotice).toHaveClass(/formNotice__notice--positive/);
		expect(await formNotice.textContent()).toMatch('Access key is enabled');

		// Clear cookies and try to access devTools
		await page.context().clearCookies();
		await page.goto('/devTools');
		await expect(page.locator('h1', { hasText: 'Developer tools' })).toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).not.toBeVisible();

		// Disable `IS_TEST` environment variable
		await setEnvironmentVariable(baseURL!, 'IS_TEST', 'false');

		await page.reload();
		await expect(page.locator('h1', { hasText: 'Developer tools' })).not.toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();

		// The `devTools.json` endpoint should be inaccesible when a key is set and no cookie is passed
		await databaseWipe(baseURL!);
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).not.toBeVisible();
		await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();

		// Reset access key
		await inputAccessKey.fill(fakeAccessKey);
		await page.locator('button', { hasText: 'Continue' }).click();
		await page.locator('a', { hasText: 'Settings' }).click();

		page.on('dialog', (dialog) => {
			expect(dialog.message()).toMatch('Are you sure you want to reset the access key?');

			dialog.accept();
		});
		await page.locator('button', { hasText: 'Reset' }).click();
		await expect(formNotice).toHaveClass(/formNotice__notice--warning/);
		expect(await formNotice.textContent()).toMatch('Access key is disabled');

		// Restore `IS_TEST` environment variable
		await setEnvironmentVariable(baseURL!, 'IS_TEST', 'true');
	});

	test('Visiting /vault redirects to access key page when one is set without the correct cookies', async ({
		baseURL,
		page
	}) => {
		await databaseWipe(baseURL!);

		// Check default /vault behavior
		await page.goto('/vault');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		// Set access key
		await page.locator('a', { hasText: 'Settings' }).click();
		await page.locator('input[name=accessKey]').fill(fakeAccessKey);
		await page.locator('div[data-test-id=settings-accessKey-form] button', { hasText: 'Enable' }).click(); // prettier-ignore
		const formNotice = page.locator('div[data-test-id=settings-accessKey-form] .formNotice__notice'); // prettier-ignore
		await expect(formNotice).toHaveClass(/formNotice__notice--positive/);
		expect(await formNotice.textContent()).toMatch('Access key is enabled');

		// Clear cookies and try to access devTools
		await page.context().clearCookies();
		await page.goto('/vault');
		await expect(page.locator('h1', { hasText: 'Access key' })).toBeVisible();
		await expect(page.locator('h1', { hasText: 'The big picture' })).not.toBeVisible();
	});
});
