import { Appearance } from '../src/lib/helpers/constants.js';
import { expect, test } from '@playwright/test';
import { format } from 'date-fns';
import {
	databaseSeed,
	databaseWipe,
	delay,
	DELAY_FOR_DECIMAL_VALUES_IN_MS,
	expectToastAndDismiss,
	MAX_DIFF_PIXEL_RATIO,
	prepareToAcceptDialog,
	setSnapshotPath
} from './fixtures/helpers.js';

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

		const balanceTypeGroup = page.locator('[data-test-id="balance-sheet-type-group"]');
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

		// Add a new account
		await currencyInput.focus();
		await page.keyboard.type('420.69', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });
		await expect(currencyInput).toHaveValue('$420.69');

		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, 'Fiat Auto Loan was created', Appearance.POSITIVE); // prettier-ignore
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

		// Check the account was created
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

		// Check the account was updated
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await balanceTypeGroup.count()).toBe(1);
		expect(await balanceTypeGroup.textContent()).toMatch('Auto loan');
		expect(await balanceTypeGroup.textContent()).toMatch('Fiat Financial Services');
		expect(await balanceTypeGroup.textContent()).toMatch('$0');

		// Check a new account with the same name can't be created
		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

		await nameInput.fill('Fiat Financial Services');
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, 'An account with the same name already exists', Appearance.NEGATIVE); // prettier-ignore

		// Check an account can't be edited to have the same name as another account
		await nameInput.fill("Alice's Savings");
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, "Alice's Savings was created", Appearance.POSITIVE); // prettier-ignore
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();

		await page.locator('a', { hasText: "Alice's Savings" }).click();
		await expect(page.locator('section', { hasText: 'Update account' })).toBeVisible();
		await expect(page.locator('h1', { hasText: "Alice's Savings" })).toBeVisible();

		await nameInput.fill('Fiat Financial Services');
		await page.locator('button', { hasText: 'Save' }).click();
		await expectToastAndDismiss(page, 'An account with the same name already exists', Appearance.NEGATIVE); // prettier-ignore
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

		const balanceTypeGroup = page.locator('[data-test-id="balance-sheet-type-group"]');
		expect(await balanceTypeGroup.textContent()).toMatch('Savings');
		expect(await balanceTypeGroup.textContent()).toMatch("Alice's Savings");
		expect(await balanceTypeGroup.textContent()).toMatch('$0');

		// Check no transactions exist
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(
			page.locator('.table__td--notice', { hasText: 'No transactions found' })
		).toBeVisible();

		const descriptionInput = page.locator('.formInput__input[name=description]');
		const accountIdSelect = page.locator('.formSelect__select[name=accountId]');
		const currencyInput = page.locator('.formCurrencyInput input[name="formatted-value"]');
		const isExcludedCheckbox = page.locator('.formInputCheckbox__input[name=isExcluded]');

		// Add a transaction
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await accountIdSelect.selectOption({ label: "Alice's Savings" });
		await descriptionInput.fill('Evergreen Market');
		await currencyInput.focus();
		await page.keyboard.type('420.69', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });
		await page.locator('button', { hasText: 'Add' }).click();

		const formSelect = page.locator('.formSelect__select[name=periods]');
		const formInput = page.locator('.formInput__input');
		await formSelect.selectOption('7'); // Lifetime
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await expectToastAndDismiss(page, 'Evergreen Market was created', Appearance.POSITIVE); // prettier-ignore
		await expect(page.locator('.table__td--notice')).not.toBeVisible();

		const tableRows = page.locator('.table__tr');
		expect(await tableRows.first().textContent()).toMatch('$420.69');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch(
			'$420.69'
		);

		// Add an excluded transaction
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await accountIdSelect.selectOption({ label: "Alice's Savings" });
		await descriptionInput.fill('Transfer from Ransack Bank');
		await currencyInput.focus();
		await page.keyboard.type('-420.69', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });
		await isExcludedCheckbox.check();
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, 'Transfer from Ransack Bank was created', Appearance.POSITIVE); // prettier-ignore

		await formSelect.selectOption('7'); // Lifetime
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		await expect(page.locator('.table__td--notice')).not.toBeVisible();
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

		// Check the balance is displayed correctly on the account page
		await page.locator('a', { hasText: "Alice's Savings" }).click();
		await expect(page.locator('h1', { hasText: "Alice's Savings" })).toBeVisible();
		await expect(isAutoCalculatedCheckbox).toBeChecked();
		await expect(page.locator('.formCurrencyInput input[name="formatted-value"]')).toHaveValue('$420.69'); // prettier-ignore
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

		// Proceed to delete account
		await prepareToAcceptDialog(
			page,
			"Are you sure you want to delete the account and all of it's associated transactions?"
		);
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message confirms account deletion
		await expectToastAndDismiss(page, "Bob's Laughable-Yield Checking was deleted", Appearance.ACTIVE); // prettier-ignore

		// Check it redirects to Balance sheeet and the account is no longer listed
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(accountLink).not.toBeVisible();

		// Check the account is no longer present in Transactions
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(accountLink).not.toBeVisible();
		await expect(page.locator('.table__td--notice')).not.toBeVisible();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('87');

		await page.locator('a', { hasText: "Alice's Limited Rewards" }).first().click();
		await expect(page.locator('h1', { hasText: "Alice's Limited Rewards" })).toBeVisible();

		// Deleting an account that doesn't exist should fail
		await databaseWipe(baseURL!);
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message shows an error
		await expectToastAndDismiss(page, "The account doesn't exist", Appearance.NEGATIVE); // prettier-ignore
	});

	test('Accounts page is rendered correctly', async ({ page }) => {
		await page.goto('/');
		await page.locator('a.layout__a', { hasText: 'Accounts' }).click();

		// Check no accounts are present
		const noAccountsTableNotice = page.locator('.table__td--notice', {
			hasText: 'No accounts found'
		});
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		await expect(page.locator('section', { hasText: 'All accounts / 0' })).toBeVisible();
		await expect(noAccountsTableNotice).toBeVisible();

		const nameInput = page.locator('.formInput__input[name=name]');
		const institutionInput = page.locator('.formInput__input[name=institution]');
		const accountTypeSelect = page.locator('.formSelect__select[name=accountTypeId]');
		const balanceGroupSelect = page.locator('.formSelect__select[name=balanceGroup]');
		const isClosed = page.locator('.formInputCheckbox__input[name=isClosed]');
		const isAutoCalculated = page.locator('.formInputCheckbox__input[name=isAutoCalculated]');
		const currencyInput = page.locator('.formCurrencyInput input[name="formatted-value"]');

		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

		// Create a new account
		await nameInput.fill("Alice's Savings");
		await institutionInput.fill('Ransack Bank');
		await accountTypeSelect.selectOption({ label: 'Savings' });
		await balanceGroupSelect.selectOption({ label: 'Cash' });
		await currencyInput.focus();
		await page.keyboard.type('420.69', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });
		await page.locator('button', { hasText: 'Add' }).click();

		// Check the account is listed
		const today = format(new Date(), 'MMM dd, yyyy');
		const tableRows = page.locator('.table__tr');
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Name' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Institution' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Account type' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Balance' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Last updated' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Marked as' })).not.toBeVisible(); // prettier-ignore
		await expect(noAccountsTableNotice).not.toBeVisible();
		expect(page.locator('td.table__td', { hasText: "Alice's Savings" })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Ransack Bank' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Savings' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '~' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$420.69' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: today })).toBeVisible;
		expect(await tableRows.count()).toBe(1);

		// Check auto-calculated accounts are marked as such
		await page.locator('a', { hasText: 'Add account' }).click();
		await nameInput.fill("Bob's Limited Rewards");
		await isAutoCalculated.check();
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Marked as' })).not.toBeVisible(); // prettier-ignore
		expect(page.locator('td.table__td', { hasText: "Alice's Savings" })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Ransack Bank' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: "Bob's Limited Rewards" })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Auto-calculated' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$0.00' })).toBeVisible;
		expect(await tableRows.count()).toBe(2);

		// Create a transaction for the auto-calculated account
		await page.locator('a.layout__a', { hasText: 'Transactions' }).click();
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await page.locator('.formSelect__select[name=accountId]').selectOption({ label: "Bob's Limited Rewards" }); // prettier-ignore
		await page.locator('.formInput__input[name=description]').fill('Evergreen Market');
		await currencyInput.focus();
		await page.keyboard.type('999');
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		const noTransactionsTableNotice = page.locator('.table__td--notice', { hasText: 'No transactions found' }) // prettier-ignore
		await expect(noTransactionsTableNotice).not.toBeVisible();
		expect(await tableRows.count()).toBe(1);
		expect(page.locator('td.table__td', { hasText: '$999.00' })).toBeVisible();
		expect(page.locator('td.table__td', { hasText: '$15.00' })).not.toBeVisible();

		// Create another transaction for the non-auto-calculated account
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await page.locator('.formSelect__select[name=accountId]').selectOption({ label: "Alice's Savings" }); // prettier-ignore
		await page.locator('.formInput__input[name=description]').fill('NetTV');
		await currencyInput.focus();
		await page.keyboard.type('15');
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		await expect(noTransactionsTableNotice).not.toBeVisible();
		expect(await tableRows.count()).toBe(2);
		expect(page.locator('td.table__td', { hasText: '$999.00' })).toBeVisible();
		expect(page.locator('td.table__td', { hasText: '$15.00' })).toBeVisible();

		// Check the auto-calculated account balance is updated
		await page.locator('a.layout__a', { hasText: 'Accounts' }).click();
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		expect(page.locator('td.table__td', { hasText: '$420.69' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$999.00' })).toBeVisible();
		expect(page.locator('td.table__td', { hasText: 'Closed' })).not.toBeVisible();

		// Check closed accounts are marked as such
		await page.locator('a.layout__a', { hasText: 'Accounts' }).click();
		await page.locator('a', { hasText: "Alice's Savings" }).click();
		await expect(page.locator('h1', { hasText: "Alice's Savings" })).toBeVisible();
		await isClosed.check();
		await page.locator('button', { hasText: 'Save' }).click();
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		await expect(noAccountsTableNotice).not.toBeVisible();
		expect(page.locator('text=Closed')).toBeVisible();
		expect(await tableRows.count()).toBe(2);

		// Check transactions can be filtered by account
		await page.locator('a.layout__a', { hasText: 'Accounts' }).click();
		await page.locator('a', { hasText: "Alice's Savings" }).click();

		const transactionsLink = page.locator('a', { hasText: 'Transactions (1)' });
		await expect(transactionsLink).toBeVisible();
		await transactionsLink.click();

		const keywordInput = page.locator('.formInput__input');
		const cardTransactions = page.locator('.card', { hasText: 'Transactions' });
		const cardNetBalance = page.locator('.card', { hasText: 'Net balance' });

		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		expect(await keywordInput.inputValue()).toMatch(/accountId:\d+/); // e.g. "accountId:123"
		expect(await cardTransactions.textContent()).toMatch('1');
		expect(await cardNetBalance.textContent()).toMatch('$15.00');
	});

	test('Account page displays balance history chart correctly', async ({
		baseURL,
		page
	}, testInfo) => {
		setSnapshotPath(testInfo);
		await databaseSeed(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Accounts' }).click();
		const chart = page.locator('.chart canvas');

		// Cash account (auto-calculated)
		await page.locator('a', { hasText: 'Emergency fund' }).click();
		// await chart.hover();
		// expect(await chart.screenshot()).toMatchSnapshot({
		// 	name: 'chart-account-cash-auto-calculated.png',
		// 	maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		// });

		// Debt account (auto-calculated)
		await page.locator('a', { hasText: 'Accounts' }).click();
		await page.locator('a', { hasText: "Alice's Limited Rewards" }).click();
		// await chart.hover();
		// expect(await chart.screenshot()).toMatchSnapshot({
		// 	name: 'chart-account-debt-auto-calculated.png',
		// 	maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		// });

		// Investment account (auto-calculated)
		await page.locator('a', { hasText: 'Accounts' }).click();
		await page.locator('a', { hasText: "Alice's Roth IRA" }).click();
		// await chart.hover();
		// expect(await chart.screenshot()).toMatchSnapshot({
		// 	name: 'chart-account-investments.png',
		// 	maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		// });

		// Debt account (auto-calculated)
		await page.locator('a', { hasText: 'Accounts' }).click();
		await page.locator('a', { hasText: 'Matress Wallet' }).click();
		// await chart.hover();
		// expect(await chart.screenshot()).toMatchSnapshot({
		// 	name: 'chart-account-cash.png',
		// 	maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		// });
	});
});
