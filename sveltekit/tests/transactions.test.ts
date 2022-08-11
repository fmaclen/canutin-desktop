import { expect, test } from '@playwright/test';
import { format, startOfMonth, subMonths } from 'date-fns';
import { PrismaClient } from '@prisma/client';

import { importCanutinFile, databaseSeed, databaseWipe } from './fixtures/helpers.js';

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

		// Check segmented control is set to the correct default value
		const segmentedControls = page.locator('.segmentedControl__button');
		expect(await segmentedControls.nth(0).textContent()).toMatch('All');
		await expect(segmentedControls.nth(0)).toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(1).textContent()).toMatch('Credits');
		await expect(segmentedControls.nth(1)).not.toHaveClass(/segmentedControl__button--active/);
		expect(await segmentedControls.nth(2).textContent()).toMatch('Debits');
		await expect(segmentedControls.nth(2)).not.toHaveClass(/segmentedControl__button--active/);

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
		await expect(tableHeaders.nth(0)).toHaveClass(/table__sortable--desc/);
		await expect(tableHeaders.nth(0)).not.toHaveClass(/table__sortable--asc/);
		expect(await tableHeaders.nth(1).textContent()).toMatch('Description');
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--desc/);
		await expect(tableHeaders.nth(1)).not.toHaveClass(/table__sortable--asc/);
		expect(await tableHeaders.nth(2).textContent()).toMatch('Category');
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--desc/);
		await expect(tableHeaders.nth(2)).not.toHaveClass(/table__sortable--asc/);
		expect(await tableHeaders.nth(3).textContent()).toMatch('Account');
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--desc/);
		await expect(tableHeaders.nth(3)).not.toHaveClass(/table__sortable--asc/);
		expect(await tableHeaders.nth(4).textContent()).toMatch('Amount');
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--active/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--desc/);
		await expect(tableHeaders.nth(4)).not.toHaveClass(/table__sortable--asc/);
	});
});
