import { expect, test } from '@playwright/test';
import { format, addDays, startOfMonth } from 'date-fns';

import { databaseSeed, databaseWipe, delay } from './fixtures/helpers.js';

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
		expect(await tableRows.count()).toBe(111);
		expect(await tableRows.first().textContent()).toMatch('Toyota - TFS Payment');
		expect(await tableRows.first().textContent()).toMatch('Automotive');
		expect(await tableRows.first().textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.first().textContent()).toMatch('-$500.00');
		expect(await tableRows.last().textContent()).toMatch('Westside Apartments');
		expect(await tableRows.last().textContent()).toMatch('Rent');
		expect(await tableRows.last().textContent()).toMatch("Bob's Laughable-Yield Checking");
		expect(await tableRows.last().textContent()).toMatch('-$2,250.00');

		// This date is set by the seed data at `src/lib/seed/seedData/transactions.ts`.
		const latestTransactionDate = addDays(startOfMonth(new Date()), 27);
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
		await expect(page.locator('.table__td', { hasText: '$2,800.00' }).first()).toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__td', { hasText: '$0.00' }).first()).not.toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__td', { hasText: '-$2,250.00' }).first()).not.toHaveClass(
			/table__td--positive/
		);
		await expect(page.locator('.table__excluded', { hasText: '-$24.21' }).first()).toHaveAttribute(
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
		expect(await tableRows.count()).toBe(36);
		expect(await cardNetBalance.textContent()).toMatch('-$7,500.00');

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
		const segmentedControls = page.locator('.segmentedControl__button');
		expect(await segmentedControls.nth(0).textContent()).toMatch('All');
		await expect(segmentedControls.nth(0)).toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(1).textContent()).toMatch('Credits');
		await expect(segmentedControls.nth(1)).not.toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(2).textContent()).toMatch('Debits');
		await expect(segmentedControls.nth(2)).not.toHaveClass(/segmentedControl__button--active/);

		// Click on "Credits"
		await segmentedControls.nth(1).click();
		await expect(segmentedControls.nth(0)).not.toHaveClass(/segmentedControl__button--active/);
		await expect(segmentedControls.nth(1)).toHaveClass(/segmentedControl__button--active/);
		await expect(segmentedControls.nth(2)).not.toHaveClass(/segmentedControl__button--active/);
		expect(await tableRows.count()).toBe(32);
		expect(await cardNetBalance.textContent()).toMatch('$6,000.00');

		// Click on "Debits"
		await segmentedControls.nth(2).click();
		await expect(segmentedControls.nth(0)).not.toHaveClass(/segmentedControl__button--active/);
		await expect(segmentedControls.nth(1)).not.toHaveClass(/segmentedControl__button--active/);
		await expect(segmentedControls.nth(2)).toHaveClass(/segmentedControl__button--active/);
		expect(await tableRows.count()).toBe(64);
		expect(await cardNetBalance.textContent()).toMatch('-$26,000.00');
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

		const nameInput = page.locator('.formInput__input[name=name]');
		await nameInput.fill("Bob's Laughable-Yield Checking");
		await page.locator('button', { hasText: 'Add' }).click();
		expect(await balanceTypeGroup.textContent()).toMatch("Bob's Laughable-Yield Checking");

		await page.locator('a', { hasText: 'Transactions' }).click();
		await page.locator('a', { hasText: 'Add transaction' }).click();
		await expect(
			page.locator('.formNotice__notice--warning', {
				hasText: 'At least one account is needed to create a transaction'
			})
		).not.toBeVisible();
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
	});

	test('A new transaction can be added and updated', async ({ page }) => {
		// Add a new account
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();

		const addButton = page.locator('button', { hasText: 'Add' });
		const balanceTypeGroup = page.locator('.balanceSheet__typeGroup');
		const nameInput = page.locator('.formInput__input[name=name]');

		await page.locator('a', { hasText: 'Add account' }).click();
		await nameInput.fill("Bob's Laughable-Yield Checking");
		// await isAutoCalculatedCheckbox.check();
		await addButton.click();
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
		await page.keyboard.type('-420.69');
		await addButton.click();

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
		await expect(page.locator('.table__excluded', { hasText: '-$420.69' })).not.toBeVisible();

		// Change date period from "Last 3 months" to "Lifetime"
		await periodSelect.selectOption('7');
		await periodSelect.dispatchEvent('change');
		await formInput.click();
		await delay();

		// Check the transaction is now excluded
		expect(await netBalanceCard.textContent()).not.toMatch('-$420.69');
		expect(await tableRows.first().textContent()).toMatch('-$420.69');
		await expect(page.locator('.table__excluded', { hasText: '-$420.69' })).toBeVisible();

		// Check the values have been updated
		await page.locator('a', { hasText: 'Toilet Paper Depot' }).click();
		await expect(isExcludedCheckbox).toBeChecked();
		await expect(isPendingCheckbox).toBeChecked();
	});
});
