import { Appearance } from '../src/lib/helpers/constants.js';
import { expect, test } from '@playwright/test';
import { format, addDays, startOfMonth, subMonths } from 'date-fns';
import { toZonedTime } from '../src/lib/helpers/timezone.js';

import {
	DELAY_FOR_DECIMAL_VALUES_IN_MS,
	databaseSeed,
	databaseWipe,
	delay,
	expectToastAndDismiss,
	prepareToAcceptDialog
} from './fixtures/helpers.js';

// This date is set by the seed data at `src/lib/seed/seedData/transactions.ts`.
const latestTransactionDate = addDays(startOfMonth(new Date()), 27);

test.describe('Transactions', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('UI is rendered correctly when there are no transactions', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('0');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch('$0');
		expect(await page.locator('.table').textContent()).toMatch('No transactions found');

		// Check out the period filters are set to the correct default values
		const selectOptions = page.locator('.formSelect__select option');
		expect(await selectOptions.count()).toBe(8);
		expect(await selectOptions.nth(0).textContent()).toMatch('This month');
		expect(await selectOptions.nth(1).textContent()).toMatch('Last month');
		expect(await selectOptions.nth(2).textContent()).toMatch('Last 3 months');
		expect(await selectOptions.nth(3).textContent()).toMatch('Last 6 months');
		expect(await selectOptions.nth(4).textContent()).toMatch('Last 12 months');
		expect(await selectOptions.nth(5).textContent()).toMatch('Year to date');
		expect(await selectOptions.nth(6).textContent()).toMatch('Last year');
		expect(await selectOptions.nth(7).textContent()).toMatch('Lifetime');
		expect(await page.locator('.formSelect__select').inputValue()).toMatch('2');

		// Check table columns are in the right order and with the correct default properties
		const tableHeaders = page.locator('button.table__sortable');
		expect(await tableHeaders.count()).toBe(5);
		expect(await tableHeaders.nth(0).textContent()).toMatch('Date');
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(1).textContent()).toMatch('Description');
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(2).textContent()).toMatch('Category');
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(3).textContent()).toMatch('Account');
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableHeaders.nth(4).textContent()).toMatch('Amount');
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--desc/);

		// Check the top navigation is present
		await page.locator('.scrollView__header a', { hasText: 'Add transaction' }).click();
		await expect(page.locator('h1', { hasText: 'Add transaction' })).toBeVisible();

		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		await page.locator('.scrollView__header a', { hasText: 'Import' }).click();
		await expect(page.locator('h1', { hasText: 'Import CanutinFile' })).toBeVisible();
	});

	test('UI is rendered correctly when there are transactions present', async ({
		page,
		baseURL
	}) => {
		await databaseSeed(baseURL!);
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		const cardTransactions = page.locator('.card', { hasText: 'Transactions' });
		const cardNetBalance = page.locator('.card', { hasText: 'Net balance' });
		expect(await cardTransactions.textContent()).toMatch('Transactions');
		expect(await cardNetBalance.textContent()).toMatch('Net balance');

		const tableRows = page.locator('.table__tr');
		await expect(page.locator('.table__td--notice')).not.toBeVisible();
		expect(await tableRows.count()).toBe(111);
		expect(await tableRows.first().textContent()).toMatch('Toyota - TFS Payment');
		expect(await tableRows.first().textContent()).toMatch('Automotive');
		expect(await tableRows.first().textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.first().textContent()).toMatch('-$500.00');
		expect(await tableRows.last().textContent()).toMatch('Westside Apartments');
		expect(await tableRows.last().textContent()).toMatch('Rent');
		expect(await tableRows.last().textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.last().textContent()).toMatch('-$2,250.00');

		// Check the date column is formatted correctly
		//
		// FIXME: date it's zoned to the device's timezone so it's possible this test will fail,
		// instead of `format(...)` we should use `formatInUTC(...)` from `src/lib/helpers/misc.ts`
		// but Playwright "Can't find module".
		expect(await tableRows.first().textContent()).toMatch(
			format(latestTransactionDate, 'MMM dd, yyyy')
		);

		// Reverse sort order while sorting by date
		const tableHeaders = page.locator('button.table__sortable');
		await tableHeaders.first().click();
		await expect(tableHeaders.first()).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.first()).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.first()).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.first().textContent()).toMatch('Westside Apartments');
		// When the date order is reversed the first transactions become the last ones
		// but they are also sorted in reserve order alphabetically by description.
		expect(await tableRows.nth(110).textContent()).toMatch('Patriot Insurance');

		// Sort by description
		await tableHeaders.nth(1).click();
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.first().textContent()).toMatch('9-5 Office Supplies');

		// Reverse sort order while sorting by description
		await tableHeaders.nth(1).click();
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(1)).toHaveClass(/table__sortable--desc/);
		expect(await tableRows.first().textContent()).toMatch('alphaStream');

		// Sort by amount
		await tableHeaders.nth(4).click();
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--desc/);
		expect(await tableRows.first().textContent()).toMatch('Initech HR * Payroll');
		expect(await tableRows.first().textContent()).toMatch('$2,800.00');

		// Reverse sort order while sorting by amount
		await tableHeaders.nth(4).click();
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).toHaveClass(/table__sortable--asc/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--desc/);
		expect(await tableRows.first().textContent()).toMatch('Westside Apartments');
		expect(await tableRows.first().textContent()).toMatch('-$2,250.00');

		// Check positive values have a different color than 0 and negative value
		await expect(page.locator('.tableValue', { hasText: '$2,800.00' }).first()).toHaveClass(
			/tableValue--positive/
		);
		await expect(page.locator('.tableValue', { hasText: '$0.00' }).first()).not.toHaveClass(
			/tableValue--positive/
		);
		await expect(page.locator('.tableValue', { hasText: '-$2,250.00' }).first()).not.toHaveClass(
			/tableValue--positive/
		);
		await expect(
			page.locator('.tableValue--excluded', { hasText: '-$24.21' }).first()
		).toHaveAttribute(
			'title',
			"This transaction is excluded from 'The big picture' and 'Balance sheet' totals"
		);

		// Filter transactions by typing a keyword
		const formInput = page.locator('.formInput__input');
		await expect(formInput).toHaveAttribute(
			'placeholder',
			'Type to filter by description, amount, category or account'
		);

		await formInput.type('transfer');
		await delay();
		expect(await cardTransactions.textContent()).toMatch('12');
		expect(await cardNetBalance.textContent()).toMatch('-$2,500.00');
		expect(await tableRows.count()).toBe(12);

		// Filter transactions by date range
		const formSelect = page.locator('.formSelect__select');
		// This month
		await formSelect.selectOption('0');
		await formSelect.dispatchEvent('change');
		await formInput.click(); // Need to click on the input field for the change event to really fire
		await delay();
		expect(await tableRows.count()).toBe(4);
		expect(await cardNetBalance.textContent()).toMatch('-$500.00');

		// Last month
		await formSelect.selectOption('1');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(4);
		expect(await cardNetBalance.textContent()).toMatch('-$1,000.00');

		// Last 3 months
		await formSelect.selectOption('2');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(12);
		expect(await cardNetBalance.textContent()).toMatch('-$2,500.00');

		// Last 6 months
		await formSelect.selectOption('3');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(24);
		expect(await cardNetBalance.textContent()).toMatch('-$5,000.00');

		// Last 12 months
		await formSelect.selectOption('4');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(48);
		expect(await cardNetBalance.textContent()).toMatch('-$10,000.00');

		// Year to date
		await formSelect.selectOption('5');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		const TRANSACTIONS_PER_MONTH = 4;
		const currentMonth = new Date().getMonth();
		expect(await tableRows.count()).toBeGreaterThan(currentMonth * TRANSACTIONS_PER_MONTH);
		// expect(await cardNetBalance.textContent()).toMatch('-$7,500.00'); // FIXME: this varies depending on the current month

		// Last year
		await formSelect.selectOption('6');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(48);
		expect(await cardNetBalance.textContent()).toMatch('-$10,000.00');

		// Lifetime
		await formSelect.selectOption('7');
		await formSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await tableRows.count()).toBe(96);
		expect(await cardNetBalance.textContent()).toMatch('-$20,000.00');

		// Check "All" is the default option
		const segmentedControls = page.locator('.buttonTag');
		expect(await segmentedControls.nth(0).textContent()).toMatch('All');
		await expect(segmentedControls.nth(0)).toHaveClass(/buttonTag--active/);
		expect(await segmentedControls.nth(1).textContent()).toMatch('Credits');
		await expect(segmentedControls.nth(1)).not.toHaveClass(/buttonTag--active/);
		expect(await segmentedControls.nth(2).textContent()).toMatch('Debits');
		await expect(segmentedControls.nth(2)).not.toHaveClass(/buttonTag--active/);

		// Click on "Credits"
		await segmentedControls.nth(1).click();
		await expect(segmentedControls.nth(0)).not.toHaveClass(/buttonTag--active/);
		await expect(segmentedControls.nth(1)).toHaveClass(/buttonTag--active/);
		await expect(segmentedControls.nth(2)).not.toHaveClass(/buttonTag--active/);
		expect(await tableRows.count()).toBe(32);
		expect(await cardNetBalance.textContent()).toMatch('$6,000.00');

		// Click on "Debits"
		await segmentedControls.nth(2).click();
		await expect(segmentedControls.nth(0)).not.toHaveClass(/buttonTag--active/);
		await expect(segmentedControls.nth(1)).not.toHaveClass(/buttonTag--active/);
		await expect(segmentedControls.nth(2)).toHaveClass(/buttonTag--active/);
		expect(await tableRows.count()).toBe(64);
		expect(await cardNetBalance.textContent()).toMatch('-$26,000.00');
	});

	test('Transactions can be filtered by account or category ids', async ({ baseURL, page }) => {
		await databaseSeed(baseURL!);
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		const tableNotice = page.locator('.table__td--notice');
		const tableRow = page.locator('.table__tr');
		const formSelect = page.locator('.formSelect__select');
		const keywordInput = page.locator('.formInput__input');
		const clearFiltersButton = page.locator('button', { hasText: 'Clear Filters' });
		const cardTransactions = page.locator('.card', { hasText: 'Transactions' });
		const cardNetBalance = page.locator('.card', { hasText: 'Net balance' });

		await expect(tableNotice).not.toBeVisible();
		expect(await cardTransactions.textContent()).toMatch('111');
		expect(await cardNetBalance.textContent()).toMatch('$935.98');
		expect(await keywordInput.inputValue()).toBe('');
		expect(clearFiltersButton).toBeDisabled();

		// Filter by `accountId`
		await page.locator('a', { hasText: 'Accounts' }).click();
		await expect(page.locator('h1', { hasText: 'Accounts' })).toBeVisible();
		expect(await tableRow.first().textContent()).toMatch("Alice's Limited Rewards");
		expect(await tableRow.first().textContent()).toMatch('672');

		// Check `accountId` filter is applied
		await page.locator('a', { hasText: '672' }).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		await expect(tableNotice).not.toBeVisible();
		expect(await keywordInput.inputValue()).toMatch(/accountId:\d+/); // e.g. "accountId:123"
		expect(await cardTransactions.textContent()).toMatch('672');
		expect(await cardNetBalance.textContent()).toMatch('$437.73');
		expect(await formSelect.inputValue()).toBe('7'); // Lifetime
		await expect(clearFiltersButton).not.toBeDisabled();

		// Apply a `categoryId` filter
		await page.locator('button', { hasText: 'Gas stations' }).first().click();
		await expect(tableNotice).not.toBeVisible();
		expect(await keywordInput.inputValue()).toMatch(/accountId:\d+/); // e.g. "accountId:123"
		expect(await keywordInput.inputValue()).toMatch(/categoryId:\d+/); // e.g. "categoryId:123"
		expect(await cardTransactions.textContent()).toMatch('48');
		expect(await cardNetBalance.textContent()).toMatch('-$1,576.32');

		// Apply excluded filter
		await keywordInput.type('excluded:true ', { delay: 100 });
		await expect(tableNotice).toBeVisible();
		expect(await keywordInput.inputValue()).toMatch(/accountId:\d+/); // e.g. "accountId:123"
		expect(await keywordInput.inputValue()).toMatch(/categoryId:\d+/); // e.g. "categoryId:123"
		expect(await keywordInput.inputValue()).toMatch('excluded:true');
		expect(await cardTransactions.textContent()).toMatch('0');
		expect(await cardNetBalance.textContent()).toMatch('$0.00');

		// Clear filters
		await clearFiltersButton.click();
		await expect(tableNotice).not.toBeVisible();
		expect(await keywordInput.inputValue()).toBe('');
		expect(await cardTransactions.textContent()).toMatch('111');
		expect(await cardNetBalance.textContent()).toMatch('$935.98');
		expect(await formSelect.inputValue()).toBe('2'); // Lifetime

		// Apply excluded filter (again)
		await keywordInput.type('excluded:true', { delay: 100 });
		await expect(tableNotice).not.toBeVisible();
		await expect(page.locator('a', { hasText: "Bob's Laughable-Yield Checking" })).not.toBeVisible(); // prettier-ignore
		expect(await page.locator('a', { hasText: 'Store.com' }).count()).toBe(6);
		expect(await cardTransactions.textContent()).toMatch('6');
		expect(await cardNetBalance.textContent()).toMatch('$0.00');
	});

	test("A new transaction can't be added if the vault has no accounts", async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();

		// Check no accounts are present
		const balanceTypeGroup = page.locator('.balanceSheet__typeGroup');
		expect(await balanceTypeGroup.count()).toBe(0);

		// Check no transactions are present
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(
			page.locator('.table__td--notice', { hasText: 'No transactions found' })
		).toBeVisible();

		const accountIdSelect = page.locator('.formSelect__select[name=accountId]');
		const descriptionInput = page.locator('.formInput__input[name=description]');
		const categoryIdSelect = page.locator('.formSelect__select[name=categoryId]');
		const yearSelect = page.locator('.formSelect__select[name=yearSelect]');
		const monthSelect = page.locator('.formSelect__select[name=monthSelect]');
		const dateSelect = page.locator('.formSelect__select[name=dateSelect]');
		const isExcluded = page.locator('.formInputCheckbox__input[name=isExcluded]');
		const isPending = page.locator('.formInputCheckbox__input[name=isPending]');
		const amountInput = page.locator('.formCurrencyInput input[name="formatted-value"]');

		// Check transaction form is disabled until an account is present
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await expect(
			page.locator('.formNotice__notice--warning', {
				hasText: 'At least one account is needed to create a transaction'
			})
		).toBeVisible();
		await expect(accountIdSelect).toBeDisabled();
		await expect(descriptionInput).toBeDisabled();
		await expect(categoryIdSelect).toBeDisabled();
		await expect(yearSelect).toBeDisabled();
		await expect(monthSelect).toBeDisabled();
		await expect(dateSelect).toBeDisabled();
		await expect(isExcluded).toBeDisabled();
		await expect(isPending).toBeDisabled();
		await expect(amountInput).toBeDisabled();
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();

		// Add an account
		await page.locator('a', { hasText: 'Add a new account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

		// Check it redirects back to "Add transaction" page
		const nameInput = page.locator('.formInput__input[name=name]');
		await nameInput.fill("Bob's Laughable-Yield Checking");
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('h1', { hasText: 'Add transaction' })).toBeVisible();
		await expect(page.locator('.formNotice__notice--warning', { hasText: 'At least one account is needed to create a transaction' })).not.toBeVisible(); // prettier-ignore
		await expect(accountIdSelect).not.toBeDisabled();
		await expect(descriptionInput).not.toBeDisabled();
		await expect(categoryIdSelect).not.toBeDisabled();
		await expect(yearSelect).not.toBeDisabled();
		await expect(monthSelect).not.toBeDisabled();
		await expect(dateSelect).not.toBeDisabled();
		await expect(isExcluded).not.toBeDisabled();
		await expect(isPending).not.toBeDisabled();
		await expect(amountInput).not.toBeDisabled();
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();

		// Check the "Add" button is disabled if "description" or "accounts" are not filled
		await descriptionInput.fill('Evergreen Market');
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();

		await descriptionInput.fill('');
		await accountIdSelect.selectOption({ label: "Bob's Laughable-Yield Checking" });
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();

		await descriptionInput.fill('Evergreen Market');
		await expect(page.locator('button', { hasText: 'Add' })).not.toBeDisabled();
	});

	test('A new transaction can be added and updated', async ({ page }) => {
		// Add a new account
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();

		const addButton = page.locator('button', { hasText: 'Add' });
		const balanceTypeGroup = page.locator('[data-test-id="balance-sheet-type-group"]');
		const nameInput = page.locator('.formInput__input[name=name]');

		await page.locator('a', { hasText: 'Add account' }).click();
		await nameInput.fill("Bob's Laughable-Yield Checking");
		// await isAutoCalculatedCheckbox.check();
		await addButton.click();
		await expectToastAndDismiss(page, "Bob's Laughable-Yield Checking was created", Appearance.POSITIVE); // prettier-ignore
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await balanceTypeGroup.textContent()).toMatch('Checking');
		expect(await balanceTypeGroup.textContent()).toMatch("Bob's Laughable-Yield Checking");

		// Check no transactions exist
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(
			page.locator('.table__td--notice', { hasText: 'No transactions found' })
		).toBeVisible();

		const accountIdSelect = page.locator('.formSelect__select[name=accountId]');
		const descriptionInput = page.locator('.formInput__input[name=description]');
		const categoryIdSelect = page.locator('.formSelect__select[name=categoryId]');
		const yearSelect = page.locator('.formSelect__select[name=yearSelect]');
		const monthSelect = page.locator('.formSelect__select[name=monthSelect]');
		const dateSelect = page.locator('.formSelect__select[name=dateSelect]');
		const isExcludedCheckbox = page.locator('.formInputCheckbox__input[name=isExcluded]');
		const isPendingCheckbox = page.locator('.formInputCheckbox__input[name=isPending]');
		const amountInput = page.locator('.formCurrencyInput input[name="formatted-value"]');

		// Verify default date selections match today's date in Australia/Sydney timezone
		const today = toZonedTime(new Date(), 'Australia/Sydney');
		const currentYear = today.getFullYear().toString();
		const currentMonth = (today.getMonth() + 1).toString();
		const currentDate = today.getDate().toString();

		await expect(yearSelect).toHaveValue(currentYear);
		await expect(monthSelect).toHaveValue(currentMonth);
		await expect(dateSelect).toHaveValue(currentDate);

		// Add a transaction
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await expect(addButton).toBeDisabled();

		await accountIdSelect.selectOption({ label: "Bob's Laughable-Yield Checking" });
		await expect(addButton).toBeDisabled();

		await descriptionInput.fill('Toilet Paper Depot');
		await expect(addButton).not.toBeDisabled();

		await categoryIdSelect.selectOption({ label: 'Groceries' });
		await yearSelect.selectOption({ label: '2020' });
		await monthSelect.selectOption({ label: '3 - Mar' });
		await dateSelect.selectOption({ label: '15' });
		await amountInput.focus();
		await page.keyboard.type('-420.69', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });
		await addButton.click();
		await expectToastAndDismiss(page, 'Toilet Paper Depot was created', Appearance.POSITIVE); // prettier-ignore

		const netBalanceCard = page.locator('.card', { hasText: 'Net balance' });
		expect(await netBalanceCard.textContent()).not.toMatch('-$420.69');

		// Change date period from "Last 3 months" to "Lifetime"
		const periodSelect = page.locator('.formSelect__select');
		const formInput = page.locator('.formInput__input');
		await periodSelect.selectOption('7');
		await periodSelect.dispatchEvent('change');
		await formInput.click();
		await delay();
		expect(await netBalanceCard.textContent()).toMatch('-$420.69');

		// Check the transaction is visible
		const tableRows = page.locator('.table__tr');
		expect(await tableRows.count()).toBe(1);
		expect(await tableRows.first().textContent()).toMatch('Mar 15, 2020');
		expect(await tableRows.first().textContent()).toMatch('Toilet Paper Depot');
		expect(await tableRows.first().textContent()).toMatch('Groceries');
		expect(await tableRows.first().textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.first().textContent()).toMatch('-$420.69');
		await expect(tableRows.first()).toHaveClass(/table__tr--highlight/);

		// A transaction can be updated
		await page.locator('a', { hasText: 'Toilet Paper Depot' }).click();
		await isExcludedCheckbox.check();
		await isPendingCheckbox.check();
		await page.locator('button', { hasText: 'save' }).click();
		expect(await netBalanceCard.textContent()).not.toMatch('-$420.69');
		await expect(page.locator('.tableValue--excluded', { hasText: '-$420.69' })).not.toBeVisible();

		// Change date period from "Last 3 months" to "Lifetime"
		await periodSelect.selectOption('7');
		await periodSelect.dispatchEvent('change');
		await formInput.click();
		await delay();

		// Check the transaction is now excluded
		expect(await netBalanceCard.textContent()).not.toMatch('-$420.69');
		expect(await tableRows.first().textContent()).toMatch('-$420.69');
		await expect(page.locator('.tableValue--excluded', { hasText: '-$420.69' })).toBeVisible();

		// Check the values have been updated
		await page.locator('a', { hasText: 'Toilet Paper Depot' }).click();
		await expect(isExcludedCheckbox).toBeChecked();
		await expect(isPendingCheckbox).toBeChecked();
	});

	test('Transaction can be deleted', async ({ baseURL, page }) => {
		await databaseSeed(baseURL!);

		// Check the transaction exists
		await page.goto('/');
		await page.locator('a', { hasText: 'Transactions' }).click();
		const transactionLink = page.locator('a', { hasText: 'Hølm Home' });
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		await expect(transactionLink).toBeVisible();

		await transactionLink.click();
		expect(await page.locator('p.dangerZone__p').first().textContent()).toBe(
			'Permanently delete transaction Hølm Home'
		);

		// Proceed to delete transaction
		await prepareToAcceptDialog(page, 'Are you sure you want to delete the transaction?');
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message confirms transaction deletion
		await expectToastAndDismiss(page, 'Hølm Home was deleted', Appearance.ACTIVE);
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		// Check the transaction is no longer present in Balance sheeet
		await page.locator('a', { hasText: 'Transactions' }).click();
		await expect(transactionLink).not.toBeVisible();

		await page.locator('a', { hasText: 'Patriot Insurance' }).first().click();
		await expect(page.locator('h1', { hasText: 'Patriot Insurance' })).toBeVisible();

		// Deleting an account that doesn't exist should fail
		await databaseWipe(baseURL!);
		await page.locator('button', { hasText: 'Delete' }).click();
		await expectToastAndDismiss(page, "The transaction doesn't exist", Appearance.NEGATIVE);
	});

	test.describe('Batch-edit', async () => {
		test.beforeEach(async ({ baseURL, page }) => {
			await databaseSeed(baseURL!);

			await page.goto('/');
			await page.locator('a', { hasText: 'Transactions' }).click();
			await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		});

		test('Selecting multiple transactions', async ({ page }) => {
			const tableRows = page.locator('.table__tr');
			await expect(page.locator('.table__td--notice')).not.toBeVisible();
			expect(await tableRows.count()).toBe(111);

			const selectAllCheckbox = page.locator('th input.batchEditor-checkbox__input');
			const selectCheckboxes = page.locator('td input.batchEditor-checkbox__input');
			const highlightedRows = page.locator('.table__tr--highlight');
			const batchEditor = page.locator('.batchEditor');

			expect(await page.locator('.table').textContent()).not.toMatch('No transactions found');
			await expect(batchEditor).not.toBeVisible();
			await expect(selectCheckboxes.first()).not.toBeChecked();
			await expect(selectCheckboxes.last()).not.toBeChecked();
			expect(await highlightedRows.count()).toBe(0);

			// Select all
			await selectAllCheckbox.check();
			await expect(batchEditor).toBeVisible();
			await expect(selectCheckboxes.first()).toBeChecked();
			await expect(selectCheckboxes.last()).toBeChecked();
			expect(await highlightedRows.count()).toBe(111);
			expect(await batchEditor.textContent()).toMatch('111 transactions selected');

			// Unselect all
			await selectAllCheckbox.uncheck();
			await expect(batchEditor).not.toBeVisible();
			await expect(selectCheckboxes.first()).not.toBeChecked();
			await expect(selectCheckboxes.last()).not.toBeChecked();
			expect(await highlightedRows.count()).toBe(0);

			// Highlight a transaction
			const transaction = page.locator('a', { hasText: 'Patriot Insurance' });
			await transaction.first().click();
			await page.locator('button', { hasText: 'Save' }).click();
			await expectToastAndDismiss(page, 'Patriot Insurance was updated', Appearance.POSITIVE);
			await expect(transaction.first()).toBeVisible();
			expect(await highlightedRows.count()).toBe(1);
			await expect(batchEditor).not.toBeVisible();

			// Check the highlighted transaction
			await page.locator("tr.table__tr--highlight input[type='checkbox']").check();
			expect(await highlightedRows.count()).toBe(1);
			await expect(batchEditor).toBeVisible();
			expect(await batchEditor.textContent()).toMatch('1 transactions selected');
			await expect(selectAllCheckbox).not.toBeChecked(); // It's actually "indeterminate", not "unchecked"

			// Unchecking the highlighted transaction removes an existing highlight
			await page.locator("tr.table__tr--highlight input[type='checkbox']").uncheck();
			expect(await highlightedRows.count()).toBe(0);
			await expect(batchEditor).not.toBeVisible();

			// Batch-editing a one transaction takes you to the single-transaction edit page
			await selectCheckboxes.nth(1).check();
			await page.locator('a', { hasText: 'Edit together' }).click();
			await expect(page.locator('h1', { hasText: 'Patriot Insurance' })).toBeVisible();
			await page.locator('button', { hasText: 'Save' }).click();
			await expectToastAndDismiss(page, 'Patriot Insurance was updated', Appearance.POSITIVE);

			// Batch-editing two or more transactions takes you to the batch-edit page
			await selectCheckboxes.nth(0).check();
			await selectCheckboxes.nth(1).check();
			expect(await batchEditor.textContent()).toMatch('2 transactions selected');
			await page.locator('a', { hasText: 'Edit together' }).click();
			await expect(page.locator('h1', { hasText: 'Batch editor' })).toBeVisible();

			await page.locator('a', { hasText: 'Discard' }).click();
			await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();
		});

		test('Edit and delete multiple transactions', async ({ page }) => {
			const tableNotice = page.locator('.table__td--notice');
			const tableRows = page.locator('.table__tr');
			const selectAllCheckbox = page.locator('th input.batchEditor-checkbox__input');
			const selectCheckboxes = page.locator('td input.batchEditor-checkbox__input');
			const batchEditor = page.locator('.batchEditor');
			const excludedTotals = page.locator('span.tableValue--excluded');

			// Select all but 2 transactions in "Last 3 months"
			await selectAllCheckbox.check();
			await selectCheckboxes.nth(0).uncheck();
			await selectCheckboxes.nth(1).uncheck();
			await expect(batchEditor).toBeVisible();
			expect(await batchEditor.textContent()).toMatch('109 transactions selected');
			expect(await tableRows.count()).toBe(111);

			// Delete selected transactions
			await page.locator('a', { hasText: 'Edit together' }).click();
			await expect(page.locator('h1', { hasText: 'Batch editor' })).toBeVisible();
			expect(await page.locator('.sectionTitle').first().textContent()).toMatch(
				'Update 109 transactions'
			);
			expect(await page.locator('.dangerZone').textContent()).toMatch(
				'Permanently delete all 109 transactions'
			);

			await prepareToAcceptDialog(page, 'Are you sure you want to delete the 109 transactions?');

			// Proceed to delete the transactions
			await page.locator('button', { hasText: 'Delete' }).click();
			await expectToastAndDismiss(page, '109 transactions were deleted', Appearance.ACTIVE);

			// Check initial values for the first transaction
			await expect(tableNotice).not.toBeVisible();
			expect(await tableRows.nth(0).textContent()).toMatch(
				format(latestTransactionDate, 'MMM dd, yyyy')
			);
			expect(await tableRows.nth(0).textContent()).toMatch('Toyota - TFS Payment');
			expect(await tableRows.nth(0).textContent()).toMatch('Automotive');
			expect(await tableRows.nth(0).textContent()).toMatch("Bob's Laughable-Yield Checking");
			expect(await tableRows.nth(0).textContent()).toMatch('-$500.00');

			// Check initial values for the second transaction
			expect(await tableRows.nth(1).textContent()).toMatch(
				format(latestTransactionDate, 'MMM dd, yyyy')
			);
			expect(await tableRows.nth(1).textContent()).toMatch('Patriot Insurance');
			expect(await tableRows.nth(1).textContent()).toMatch('Insurance');
			expect(await tableRows.nth(1).textContent()).toMatch("Alice's Limited Rewards");
			expect(await tableRows.nth(1).textContent()).toMatch('-$135.67');

			// Check that there are only 2 transactions left
			expect(await tableRows.count()).toBe(2);

			// Check none of the transactions have excluded totals
			expect(await excludedTotals.count()).toBe(0);

			await selectAllCheckbox.check();
			expect(await batchEditor.textContent()).toMatch('2 transactions selected');

			// Edit the 2 transactions
			await page.locator('a', { hasText: 'Edit together' }).click();
			await expect(page.locator('h1', { hasText: 'Batch editor' })).toBeVisible();
			expect(await page.locator('.sectionTitle').first().textContent()).toMatch(
				'Update 2 transactions'
			);

			// Check all edit checkboxes are unchecked and fields are disabled by default
			const applyButton = page.locator('button', { hasText: 'Apply' });
			await expect(applyButton).toBeDisabled();

			// Edit account
			const accountIdEditCheckbox = page.locator('input.formInputCheckbox__input[name=accountIdEdit]'); // prettier-ignore
			const accountIdSelect = page.locator('.formSelect__select[name=accountId]'); // prettier-ignore
			await expect(accountIdEditCheckbox).not.toBeChecked();
			await expect(accountIdSelect).toBeDisabled();

			await accountIdEditCheckbox.check();
			await expect(applyButton).not.toBeDisabled();
			await expect(accountIdSelect).not.toBeDisabled();
			expect(await accountIdSelect.textContent()).toMatch('Multiple accounts');

			await accountIdSelect.selectOption({ label: 'Emergency Fund' });

			// Edit description
			const descriptionEditCheckbox = page.locator('input.formInputCheckbox__input[name=descriptionEdit]'); // prettier-ignore
			const descriptionInput = page.locator('.formInput__input[name=description]');
			await expect(descriptionEditCheckbox).not.toBeChecked();
			await expect(descriptionInput).toBeDisabled();

			await descriptionEditCheckbox.check();
			await expect(descriptionInput).not.toBeDisabled();
			await expect(descriptionInput).toHaveAttribute('placeholder', 'Multiple descriptions');
			await expect(descriptionInput).toHaveValue('');

			await descriptionInput.fill('Accidentes? Llámenos 1-800-877-7770');

			// Edit category
			const categoryIdEditCheckbox = page.locator('input.formInputCheckbox__input[name=categoryIdEdit]'); // prettier-ignore
			const categoryIdSelect = page.locator('.formSelect__select[name=categoryId]');
			await expect(categoryIdEditCheckbox).not.toBeChecked();
			await expect(categoryIdSelect).toBeDisabled();

			await categoryIdEditCheckbox.check();
			await expect(categoryIdSelect).not.toBeDisabled();
			expect(await categoryIdSelect.textContent()).toMatch('Multiple categories');

			await categoryIdSelect.selectOption({ label: 'Legal' });

			// Dates are shared between the 2 transactions
			const dateEditCheckbox = page.locator('input.formInputCheckbox__input[name=dateEdit]');
			const placeholderDateInput = page.locator('.formInput__input[name=placeholderDate]');
			const yearSelect = page.locator('.formSelect__select[name=yearSelect]');
			const monthSelect = page.locator('.formSelect__select[name=monthSelect]');
			const dateSelect = page.locator('.formSelect__select[name=dateSelect]');
			await expect(dateEditCheckbox).not.toBeChecked();
			await expect(placeholderDateInput).not.toBeVisible();
			await expect(yearSelect).toBeVisible();
			await expect(yearSelect).toHaveValue(new Date().getFullYear().toString());
			await expect(monthSelect).toBeVisible();
			await expect(monthSelect).toHaveValue((new Date().getMonth() + 1).toString());
			await expect(dateSelect).toBeVisible();
			expect(parseInt(await dateSelect.inputValue())).toBeGreaterThanOrEqual(1);
			expect(parseInt(await dateSelect.inputValue())).toBeLessThanOrEqual(31);

			// Edit excluded from totals
			const isExcludedEditCheckbox = page.locator('input.formInputCheckbox__input[name=isExcludedEdit]'); // prettier-ignore
			const isExcludedCheckbox = page.locator('.formInputCheckbox__input[name=isExcluded]');
			await expect(isExcludedEditCheckbox).not.toBeChecked();
			await expect(isExcludedCheckbox).toBeDisabled();

			await isExcludedEditCheckbox.check();
			await expect(isExcludedCheckbox).not.toBeDisabled();

			await isExcludedCheckbox.check();

			// Edit pending
			const isPendingEditCheckbox = page.locator('input.formInputCheckbox__input[name=isPendingEdit]'); // prettier-ignore
			const isPendingCheckbox = page.locator('input.formInputCheckbox__input[name=isPending]');
			await expect(isPendingEditCheckbox).not.toBeChecked();
			await expect(isPendingCheckbox).toBeDisabled();

			await isPendingEditCheckbox.check();
			await expect(isPendingCheckbox).not.toBeDisabled();

			await isPendingCheckbox.check();

			// Edit amount
			const amountEditCheckbox = page.locator('input.formInputCheckbox__input[name=valueEdit]');
			const placeholderAmountInput = page.locator('.formInput__input[name=placeholderValue]'); // prettier-ignore
			const amountInput = page.locator('.currencyInput__formatted[name="formatted-value"]');
			await expect(amountEditCheckbox).not.toBeChecked();
			await expect(placeholderAmountInput).toBeDisabled();
			await expect(amountInput).not.toBeVisible();
			await expect(placeholderAmountInput).toHaveAttribute('placeholder', 'Multiple amounts');

			await amountEditCheckbox.check();
			await expect(placeholderAmountInput).not.toBeVisible();
			await expect(amountInput).toBeVisible();

			await amountInput.type('999');
			await applyButton.click();
			await expectToastAndDismiss(page, '2 transactions were updated', Appearance.POSITIVE); // prettier-ignore

			// Check the first transaction was edited
			expect(await tableRows.nth(0).textContent()).toMatch('Accidentes? Llámenos 1-800-877-7770');
			expect(await tableRows.nth(0).textContent()).toMatch('Legal');
			expect(await tableRows.nth(0).textContent()).toMatch('Emergency Fund');
			expect(await tableRows.nth(0).textContent()).toMatch('$999.00');
			expect(await tableRows.nth(0).textContent()).toMatch('28');

			// Check the second transaction was edited
			expect(await tableRows.nth(1).textContent()).toMatch('Accidentes? Llámenos 1-800-877-7770');
			expect(await tableRows.nth(1).textContent()).toMatch('Legal');
			expect(await tableRows.nth(1).textContent()).toMatch('Emergency Fund');
			expect(await tableRows.nth(1).textContent()).toMatch('$999.00');
			expect(await tableRows.nth(1).textContent()).toMatch('28');

			// Check only 2 transactions are visible
			expect(await tableRows.count()).toBe(2);

			// Check none of the transactions have excluded totals
			expect(await excludedTotals.count()).toBe(2);

			// Update the date of the first transaction
			await page.locator('a', { hasText: 'Accidentes? Llámenos 1-800-877-7770' }).first().click();
			await dateSelect.selectOption({ label: '29' });
			await page.locator('button', { hasText: 'Save' }).click();
			await expectToastAndDismiss(page, 'Accidentes? Llámenos 1-800-877-7770 was updated', Appearance.POSITIVE); // prettier-ignore
			expect(await tableRows.nth(0).textContent()).toMatch('29');
			expect(await tableRows.nth(1).textContent()).toMatch('28');

			// Update the 2 transactions again
			await selectAllCheckbox.check();
			await page.locator('a', { hasText: 'Edit together' }).click();

			// Check that accounts are the same
			await expect(accountIdEditCheckbox).not.toBeChecked();
			await expect(accountIdSelect).toBeDisabled();
			expect(await accountIdSelect.textContent()).toMatch('Emergency Fund');

			// Check that descriptions are the same
			await expect(descriptionEditCheckbox).not.toBeChecked();
			await expect(descriptionInput).toBeDisabled();
			await expect(descriptionInput).not.toHaveAttribute('placeholder', 'Multiple descriptions');
			expect(await descriptionInput.inputValue()).toMatch('Accidentes? Llámenos 1-800-877-7770');

			// Check that categories are the same
			await expect(categoryIdEditCheckbox).not.toBeChecked();
			await expect(categoryIdSelect).toBeDisabled();
			expect(await categoryIdSelect.textContent()).toMatch('Legal');

			// Check the dates are different
			await expect(dateEditCheckbox).not.toBeChecked();
			await expect(yearSelect).not.toBeVisible();
			await expect(monthSelect).not.toBeVisible();
			await expect(dateSelect).not.toBeVisible();
			await expect(placeholderDateInput).toBeVisible();
			await expect(placeholderDateInput).toHaveAttribute('placeholder', 'Multiple dates');

			// Edit the date
			await dateEditCheckbox.check();
			await expect(yearSelect).toBeVisible();
			await expect(monthSelect).toBeVisible();
			await expect(dateSelect).toBeVisible();
			await expect(placeholderDateInput).not.toBeVisible();
			await dateSelect.selectOption({ label: '15' });

			// Check that excluded is the same
			await expect(isExcludedEditCheckbox).not.toBeChecked();
			await expect(isExcludedCheckbox).toBeDisabled();
			await expect(isExcludedCheckbox).toBeChecked();

			// Check that pending is the same
			await expect(isPendingEditCheckbox).not.toBeChecked();
			await expect(isPendingCheckbox).toBeDisabled();
			await expect(isPendingCheckbox).toBeChecked();

			// Check that amount is the same
			await expect(amountEditCheckbox).not.toBeChecked();
			await expect(placeholderAmountInput).not.toBeVisible();
			await expect(amountInput).toBeDisabled();
			expect(await amountInput.inputValue()).toMatch('$999');

			await applyButton.click();
			await expectToastAndDismiss(page, ' 2 transactions were updated', Appearance.POSITIVE);

			const formSelect = page.locator('.formSelect__select');
			const formInput = page.locator('.formInput__input');
			await formSelect.selectOption('7'); // Lifetime
			await formSelect.dispatchEvent('change');
			await formInput.click();
			await delay();
			expect(await tableRows.nth(0).textContent()).toMatch('15');
			expect(await tableRows.nth(1).textContent()).toMatch('15');
		});
	});

	test('Filter transactions by a custom date range', async ({ page, baseURL }) => {
		await databaseSeed(baseURL!);

		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const chartPeriods = page.locator('.chart__period');
		expect(await chartPeriods.count()).toBe(13);

		await chartPeriods.nth(0).click();
		await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

		const selectOptions = page.locator('.formSelect__select option');
		const twelveMonthsAgo = format(subMonths(new Date(), 12), 'MMMM yyyy');
		const sixMonthsAgo = format(subMonths(new Date(), 7), 'MMMM yyyy');
		const thisMonth = format(new Date(), 'MMMM yyyy');
		expect(await selectOptions.nth(8).textContent()).toMatch(twelveMonthsAgo);

		await delay();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('37');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch('$808.77'); // prettier-ignore

		await page.locator('a', { hasText: 'The big picture' }).click();
		await chartPeriods.nth(5).click();
		expect(await selectOptions.nth(8).textContent()).toMatch(sixMonthsAgo);

		await delay();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('37');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch('$217.01'); // prettier-ignore

		await page.locator('a', { hasText: 'The big picture' }).click();
		await chartPeriods.nth(12).click();
		expect(await selectOptions.nth(8).textContent()).toMatch(thisMonth);

		await delay();
		expect(await page.locator('.card', { hasText: 'Transactions' }).textContent()).toMatch('37');
		expect(await page.locator('.card', { hasText: 'Net balance' }).textContent()).toMatch('$228.44'); // prettier-ignore
	});

	test.describe('Timezone handling', () => {
		test.use({ timezoneId: 'Australia/Sydney' });
		test('Transaction timestamps are correctly rendered in Australia timezone', async ({
			page,
			baseURL
		}) => {
			await databaseSeed(baseURL!);
			await page.goto('/');
			await page.locator('a', { hasText: 'Transactions' }).click();
			await expect(page.locator('h1', { hasText: 'Transactions' })).toBeVisible();

			// Create a new transaction
			await page.locator('a', { hasText: 'Add transaction' }).click();
			await expect(page.locator('h1', { hasText: 'Add transaction' })).toBeVisible();

			// Fill in transaction details
			const accountIdSelect = page.locator('.formSelect__select[name=accountId]');
			const descriptionInput = page.locator('.formInput__input[name=description]');
			const categoryIdSelect = page.locator('.formSelect__select[name=categoryId]');
			const yearSelect = page.locator('.formSelect__select[name=yearSelect]');
			const monthSelect = page.locator('.formSelect__select[name=monthSelect]');
			const dateSelect = page.locator('.formSelect__select[name=dateSelect]');
			const amountInput = page.locator('.formCurrencyInput input[name="formatted-value"]');

			// Verify default date selections match today's date in Australia/Sydney timezone
			const today = toZonedTime(new Date(), 'Australia/Sydney');
			const currentYear = today.getFullYear().toString();
			const currentMonth = (today.getMonth() + 1).toString();
			const currentDate = today.getDate().toString();

			await expect(yearSelect).toHaveValue(currentYear);
			await expect(monthSelect).toHaveValue(currentMonth);
			await expect(dateSelect).toHaveValue(currentDate);

			await accountIdSelect.selectOption({ label: "Bob's Laughable-Yield Checking" });
			await descriptionInput.fill('Timezone Test Transaction');
			await categoryIdSelect.selectOption({ label: 'Groceries' });
			await yearSelect.selectOption({ label: '2025' });
			await monthSelect.selectOption({ label: '4 - Apr' });
			await dateSelect.selectOption({ label: '28' });
			await amountInput.focus();
			await page.keyboard.type('-100.00', { delay: DELAY_FOR_DECIMAL_VALUES_IN_MS });

			// Save the transaction
			await page.locator('button', { hasText: 'Add' }).click();
			await expectToastAndDismiss(
				page,
				'Timezone Test Transaction was created',
				Appearance.POSITIVE
			);

			// Verify the transaction is displayed with the correct date in Australia timezone
			const tableRows = page.locator('.table__tr');
			const displayedDate = await tableRows.first().textContent();
			expect(displayedDate).toMatch('Apr 28, 2025');

			// Click into the transaction to verify the date components
			await page.locator('a', { hasText: 'Timezone Test Transaction' }).click();
			await expect(yearSelect).toHaveValue('2025');
			await expect(monthSelect).toHaveValue('4');
			await expect(dateSelect).toHaveValue('28');
		});
	});
});
