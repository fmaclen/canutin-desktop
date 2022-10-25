import { expect, test } from '@playwright/test';
import { databaseSeed, databaseWipe, delay } from './fixtures/helpers.js';

test.describe('Accounts', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('A new account can be added and updated', async ({ page }) => {
		// Check no accounts exist
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investment' }).textContent()).toMatch('$0');

		const balanceTypeGroup = page.locator('.balanceSheet__typeGroup');
		expect(await balanceTypeGroup.count()).toBe(0);

		// Check the form has the correct behavior
		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();

		const isClosedCheckbox = page.locator('.formInputCheckbox__input[name=isClosed]');
		const isAutoCalculatedCheckbox = page.locator(
			'.formInputCheckbox__input[name=isAutoCalculated]'
		);
		const currencyInput = page.locator('.formCurrencyInput input[name="formatted-value"]');
		await expect(isClosedCheckbox).not.toBeChecked();
		await expect(isAutoCalculatedCheckbox).not.toBeChecked();
		await expect(currencyInput).not.toBeDisabled();

		await isAutoCalculatedCheckbox.check();
		await expect(currencyInput).toBeDisabled();

		await isAutoCalculatedCheckbox.uncheck();
		await expect(currencyInput).not.toBeDisabled();

		const nameInput = page.locator('.formInput__input[name=name]');
		const institutionInput = page.locator('.formInput__input[name=institution]');
		const accountTypeSelect = page.locator('.formSelect__select[name=accountTypeId]');
		const balanceGroupSelect = page.locator('.formSelect__select[name=balanceGroup]');
		await nameInput.fill('Fiat Auto Loan');
		await accountTypeSelect.selectOption({ label: 'Auto loan' });
		await balanceGroupSelect.selectOption({ label: 'Debt' });
		await institutionInput.fill('Ransack Bank Auto Loans');
		await expect(page.locator('button', { hasText: 'Add' })).not.toBeDisabled();

		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('The account was added successfully');

		// Add a new account
		await currencyInput.focus();
		await page.keyboard.type('420.69');
		await expect(currencyInput).toHaveValue('$420.69');

		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch('The account was added successfully');
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await balanceTypeGroup.count()).toBe(1);
		expect(await balanceTypeGroup.textContent()).toMatch('Auto Loan');
		expect(await balanceTypeGroup.textContent()).toMatch('Fiat Auto Loan');
		expect(await balanceTypeGroup.textContent()).toMatch('$421');

		await page.locator('a', { hasText: 'Fiat Auto Loan' }).click();
		await expect(page.locator('section', { hasText: 'Update account' })).toBeVisible();
		await expect(page.locator('h1', { hasText: 'Fiat Auto Loan' })).toBeVisible();
		await expect(nameInput).toHaveValue('Fiat Auto Loan');
		expect(await accountTypeSelect.textContent()).toMatch('Auto loan');
		expect(await balanceGroupSelect.textContent()).toMatch('Debt');
		await expect(institutionInput).toHaveValue('Ransack Bank Auto Loans');
		await expect(currencyInput).toHaveValue('$420.69');

		// Check the account was created successfully
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

		// Update the asset
		await page.locator('a', { hasText: 'Fiat Auto Loan' }).click();
		await expect(page.locator('h1', { hasText: 'Fiat Auto Loan' })).toBeVisible();
		await expect(isAutoCalculatedCheckbox).not.toBeChecked();
		await expect(currencyInput).not.toBeDisabled();

		await nameInput.fill('Fiat Financial Services');
		await isAutoCalculatedCheckbox.check();
		await expect(currencyInput).toBeDisabled();
		await page.locator('button', { hasText: 'Save' }).click();

		// Check the account was updated successfully
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await balanceTypeGroup.count()).toBe(1);
		expect(await balanceTypeGroup.textContent()).toMatch('Auto loan');
		expect(await balanceTypeGroup.textContent()).toMatch('Fiat Financial Services');
		expect(await balanceTypeGroup.textContent()).toMatch('$0');

		// Check a new account with the same name can't be created
		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();
		await expect(statusBar).not.toHaveClass(/statusBar--negative/);

		await nameInput.fill('Fiat Financial Services');
		await page.locator('button', { hasText: 'Dismiss' }).click();
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--negative/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch('An account with the same name already exists');

		// Check an account can't be edited to have the same name as another account
		await nameInput.fill("Alice's Savings");
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch('The account was added successfully');
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

		await page.locator('a', { hasText: "Alice's Savings" }).click();
		await expect(page.locator('section', { hasText: 'Update account' })).toBeVisible();
		await expect(page.locator('h1', { hasText: "Alice's Savings" })).toBeVisible();

		await nameInput.fill('Fiat Financial Services');
		await page.locator('button', { hasText: 'Save' }).click();
		await expect(statusBar).toHaveClass(/statusBar--negative/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch('An account with the same name already exists');
	});

	test('Auto-calculated accounts show the correct balance', async ({ page }) => {
		// Check no accounts exist
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');

		const nameInput = page.locator('.formInput__input[name=name]');
		const isAutoCalculatedCheckbox = page.locator(
			'.formInputCheckbox__input[name=isAutoCalculated]'
		);
		const accountTypeSelect = page.locator('.formSelect__select[name=accountTypeId]');

		// Add a new account
		await page.locator('a', { hasText: 'Add account' }).click();
		await nameInput.fill("Alice's Savings");
		await accountTypeSelect.selectOption({ label: 'Savings' });
		await isAutoCalculatedCheckbox.check();
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');

		const balanceTypeGroup = page.locator('.balanceSheet__typeGroup');
		expect(await balanceTypeGroup.textContent()).toMatch('Savings');
		expect(await balanceTypeGroup.textContent()).toMatch("Alice's Savings");
		expect(await balanceTypeGroup.textContent()).toMatch('$0');

		// Check no transactions exist
		const noTransactionsNotice = page.locator('.table__td--notice', {
			hasText: 'No transactions found'
		});
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(noTransactionsNotice).toBeVisible();

		const descriptionInput = page.locator('.formInput__input[name=description]');
		const accountIdSelect = page.locator('.formSelect__select[name=accountId]');
		const currencyInput = page.locator('.formCurrencyInput input[name="formatted-value"]');
		const isExcludedCheckbox = page.locator('.formInputCheckbox__input[name=isExcluded]');

		// Add a transaction
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await accountIdSelect.selectOption({ label: "Alice's Savings" });
		await descriptionInput.fill('Evergreen Market');
		await currencyInput.focus();
		await page.keyboard.type('420.69');
		await page.locator('button', { hasText: 'Add' }).click();

		const statusBar = page.locator('.statusBar');
		await expect(statusBar).toHaveClass(/statusBar--positive/, { timeout: 10000 });
		await page.locator('button', { hasText: 'Dismiss' }).click();

		const tableRows = page.locator('.table__tr');
		await expect(noTransactionsNotice).not.toBeVisible();
		expect(await tableRows.first().textContent()).toMatch('$420.69');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch(
			'$420.69'
		);

		// Add an excluded transaction
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await accountIdSelect.selectOption({ label: "Alice's Savings" });
		await descriptionInput.fill('Transfer from Ransack Bank');
		await currencyInput.focus();
		await page.keyboard.type('-420.69');
		await isExcludedCheckbox.check();
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/, { timeout: 10000 });
		expect(await tableRows.first().textContent()).toMatch('$420.69');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch(
			'$420.69'
		);
		// Check the account balance is calculated correctly
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$421');
		expect(await balanceTypeGroup.textContent()).toMatch('Savings');
		expect(await balanceTypeGroup.textContent()).toMatch("Alice's Savings");
		expect(await balanceTypeGroup.textContent()).toMatch('$421');
	});

	test("Account and it's transactions can be deleted", async ({ baseURL, page }) => {
		await databaseSeed(baseURL!);

		// Check the account exists and that it has transactions
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();

		const accountLink = page.locator('a', { hasText: "Bob's Laughable-Yield Checking" });
		await expect(accountLink.first()).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('111');

		// Delete account
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(accountLink).toBeVisible();

		await accountLink.click();
		expect(await page.locator('p.dangerZone__p').first().textContent()).toBe(
			"Permanently delete account Bob's Laughable-Yield Checking (including transactions)"
		);

		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--active/);
		expect(await statusBar.textContent()).not.toMatch(
			"The account —Bob's Laughable-Yield Checking— was deleted successfully"
		);

		// Prepare to confirm the dialog prompt
		page.on('dialog', (dialog) => {
			expect(dialog.message()).toMatch(
				"Are you sure you want to delete the account and all of it's associated transactions?"
			);

			dialog.accept();
		});

		// Proceed to delete account
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message confirms account deletion
		await expect(statusBar).toHaveClass(/statusBar--active/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch(
			"The account —Bob's Laughable-Yield Checking— was deleted successfully"
		);

		// Check it redirects to Balance sheeet and the account is no longer listed
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(accountLink).not.toBeVisible();

		// Check the account is no longer present in Transactions
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(accountLink).not.toBeVisible();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('87');

		await page.locator('a', { hasText: "Alice's Limited Rewards" }).first().click();
		await expect(page.locator('h1', { hasText: "Alice's Limited Rewards" })).toBeVisible();

		// Deleting an account that doesn't exist should fail
		await databaseWipe(baseURL!);
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message shows an error
		await expect(statusBar).toHaveClass(/statusBar--negative/, { timeout: 10000 });
		expect(await statusBar.textContent()).toMatch("The account doesn't exist");
	});
});
