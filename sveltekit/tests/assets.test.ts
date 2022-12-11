import { Appearance } from '$lib/helpers/constants.js';
import { expect, test } from '@playwright/test';
import { format } from 'date-fns';
import {
	databaseSeed,
	databaseWipe,
	expectToastAndDismiss,
	MAX_DIFF_PIXEL_RATIO,
	prepareToAcceptDialog,
	setSnapshotPath
} from './fixtures/helpers.js';

test.describe('Assets', () => {
	test.beforeEach(async ({ baseURL }) => {
		await databaseWipe(baseURL!);
	});

	test('A new asset can be added and updated', async ({ page }) => {
		// Check no assets exist
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await page.locator('.card', { hasText: 'Cash' }).textContent()).toMatch('$0');
		expect(await page.locator('.card', { hasText: 'Investment' }).textContent()).toMatch('$0');

		const balanceTypeGroup = page.locator('.balanceSheet__typeGroup');
		expect(await balanceTypeGroup.count()).toBe(0);

		const isSoldCheckbox = page.locator('.formInputCheckbox__input[name=isSold]');
		const nameInput = page.locator('.formInput__input[name=name]');
		const symbolInput = page.locator('.formInput__input[name=symbol]');
		const quantityInput = page.locator('.formInput__input[name=quantity]');
		const costInput = page.locator('.formCurrencyInput input[name="formatted-cost"]');
		const valueInput = page.locator('.formCurrencyInput input[name="formatted-value"]');
		const assetTypeSelect = page.locator('.formSelect__select[name=assetTypeId]');
		const balanceGroupSelect = page.locator('.formSelect__select[name=balanceGroup]');

		// Add a new asset of type "Security" (which `isQuantifiable`)
		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();
		await expect(symbolInput).not.toBeVisible();

		await nameInput.fill('GameStop');
		await assetTypeSelect.selectOption({ label: 'Security' });
		await balanceGroupSelect.selectOption({ label: 'Investments' });
		await expect(symbolInput).toBeVisible();
		await expect(page.locator('button', { hasText: 'Add' })).not.toBeDisabled();
		await expect(page.locator('section', { hasText: 'New asset' })).toBeVisible();
		await expect(page.locator('section', { hasText: 'Update asset' })).not.toBeVisible();

		await symbolInput.fill('GME');
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, "GameStop was created successfully", Appearance.POSITIVE); // prettier-ignore

		// Check the asset was created successfully
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await balanceTypeGroup.textContent()).toMatch('GameStop');
		expect(await balanceTypeGroup.textContent()).toMatch('$0');
		expect(await balanceTypeGroup.count()).toBe(1);

		await page.locator('a', { hasText: 'GameStop' }).click();
		await expect(page.locator('h1', { hasText: 'GameStop' })).toBeVisible();
		await expect(nameInput).toHaveValue('GameStop');
		await expect(symbolInput).toHaveValue('GME');

		// FIXME: these assertions are only testing that "Security" or "Investments"
		// are one of the options but NOT that is the selected option
		expect(await assetTypeSelect.textContent()).toMatch('Security');
		expect(await balanceGroupSelect.textContent()).toMatch('Investments');

		await expect(page.locator('section', { hasText: 'Update asset' })).toBeVisible();
		await expect(page.locator('section', { hasText: 'New asset' })).not.toBeVisible();

		// Update the asset
		await quantityInput.fill('4.20');
		await costInput.focus();
		await page.keyboard.type('69', { delay: 25 });
		await expect(valueInput).toBeDisabled();
		await expect(valueInput).toHaveValue('$289.8');

		await page.locator('button', { hasText: 'Save' }).click();
		await expectToastAndDismiss(page, "GameStop was updated successfully", Appearance.POSITIVE); // prettier-ignore

		// Check the account was updated successfully
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await balanceTypeGroup.count()).toBe(1);
		expect(await balanceTypeGroup.textContent()).toMatch('Security');
		expect(await balanceTypeGroup.textContent()).toMatch('GameStop');
		expect(await balanceTypeGroup.textContent()).toMatch('$290');

		await page.locator('a', { hasText: 'GameStop' }).click();
		await expect(quantityInput).toBeVisible();
		await expect(costInput).toBeVisible();
		await expect(symbolInput).toBeVisible();

		// Check that the asset's available fields change when the type is one that's not "quantifiable"
		await assetTypeSelect.selectOption({ label: 'Business' });
		await balanceGroupSelect.selectOption({ label: 'Other assets' });
		await expect(symbolInput).not.toBeVisible();
		await expect(quantityInput).not.toBeVisible();
		await expect(costInput).not.toBeVisible();
		await expect(isSoldCheckbox).not.toBeChecked();

		await isSoldCheckbox.check();
		await page.locator('button', { hasText: 'Save' }).click();
		await page.locator('a', { hasText: 'GameStop' }).click();

		// FIXME: these assertions are only testing that "Business" or "Other assets"
		// are one of the options but NOT that is the selected option
		expect(await assetTypeSelect.textContent()).toMatch('Business');
		expect(await balanceGroupSelect.textContent()).toMatch('Other assets');

		await expect(isSoldCheckbox).toBeChecked();
		await expect(valueInput).toHaveValue('$289.8');
		await expect(isSoldCheckbox).toBeChecked();

		// Check the asset type was updated successfully
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		expect(await balanceTypeGroup.count()).toBe(1);
		expect(await balanceTypeGroup.textContent()).toMatch('Business');
		expect(await balanceTypeGroup.textContent()).toMatch('GameStop');
		expect(await balanceTypeGroup.textContent()).toMatch('$290');

		// Another asset with the same name can't be created
		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

		await nameInput.fill('GameStop');
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, 'An asset with the same name already exists', Appearance.NEGATIVE); // prettier-ignore

		// Check an asset can't be edited to have the same name as another asset
		await nameInput.fill('AMC Entertainment Holdings Inc');
		await page.locator('button', { hasText: 'Add' }).click();
		await expectToastAndDismiss(page, "AMC Entertainment Holdings Inc was created successfully", Appearance.POSITIVE); // prettier-ignore

		await page.locator('a', { hasText: 'AMC Entertainment Holdings Inc' }).click();
		await expect(page.locator('h1', { hasText: 'AMC Entertainment Holdings Inc' })).toBeVisible();

		// Rename using an existing asset name
		await nameInput.fill('GameStop');
		await page.locator('button', { hasText: 'Save' }).click();
		await expectToastAndDismiss(page, 'An asset with the same name already exists', Appearance.NEGATIVE); // prettier-ignore
	});

	test('Asset can be deleted', async ({ baseURL, page }) => {
		await databaseSeed(baseURL!);

		// Check the asset exists
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		const assetLink = page.locator('a', { hasText: '1998 Fiat Multipla' });
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(assetLink).toBeVisible();

		await assetLink.click();
		expect(await page.locator('p.dangerZone__p').first().textContent()).toBe(
			'Permanently delete asset 1998 Fiat Multipla'
		);

		// Proceed to delete asset
		await prepareToAcceptDialog(page, 'Are you sure you want to delete the asset?');
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message confirms asset deletion
		await expectToastAndDismiss(page, "1998 Fiat Multipla was deleted", Appearance.ACTIVE); // prettier-ignore

		// Check it redirects to Balance sheeet and the asset is no longer listed
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(assetLink).not.toBeVisible();

		await page.locator('a', { hasText: 'Manchild Card Collection' }).first().click();
		await expect(page.locator('h1', { hasText: 'Manchild Card Collection' })).toBeVisible();

		// Deleting an account that doesn't exist should fail
		await databaseWipe(baseURL!);
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message shows an error
		await expectToastAndDismiss(page, "The asset doesn't exist", Appearance.NEGATIVE); // prettier-ignore
	});

	test('Assets page is rendered correctly', async ({ page }) => {
		await page.goto('/');
		await page.locator('a.layout__a', { hasText: 'Assets' }).click();

		// Check no assets are present
		const tableNotice = page.locator('.table__td--notice', { hasText: 'No assets found' });
		await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
		await expect(page.locator('section', { hasText: 'All assets / 0' })).toBeVisible();
		await expect(tableNotice).toBeVisible();

		const nameInput = page.locator('.formInput__input[name=name]');
		const symbolInput = page.locator('.formInput__input[name=symbol]');
		const quantityInput = page.locator('.formInput__input[name=quantity]');
		const costInput = page.locator('.formCurrencyInput input[name="formatted-cost"]');
		const assetTypeSelect = page.locator('.formSelect__select[name=assetTypeId]');
		const balanceGroupSelect = page.locator('.formSelect__select[name=balanceGroup]');
		const isSoldCheckbox = page.locator('.formInputCheckbox__input[name=isSold]');

		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

		// Create a new asset
		await nameInput.fill('1998 Fiat Multipla');
		await assetTypeSelect.selectOption({ label: 'Vehicle' });
		await balanceGroupSelect.selectOption({ label: 'Other assets' });
		await page.locator('button', { hasText: 'Add' }).click();

		// Check the asset is listed
		const today = format(new Date(), 'MMM dd, yyyy');
		const tableRows = page.locator('.table__tr');
		await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Name' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Asset type' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Value' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Last updated' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Marked as' })).not.toBeVisible(); // prettier-ignore
		await expect(page.locator('button.table__sortable', { hasText: 'Quantity' })).not.toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Cost' })).not.toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Symbol' })).not.toBeVisible();
		await expect(tableNotice).not.toBeVisible();
		expect(page.locator('td.table__td', { hasText: '1998 Fiat Multipla' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Vehicle' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$6,570.51' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: today })).toBeVisible;
		expect(await tableRows.count()).toBe(1);

		// Check the "Quantity, Cost and Symbol" columns are visible when at least one asset is 'quantifiable"
		await page.locator('a', { hasText: 'Add asset' }).click();
		await nameInput.fill('Bitcoin');
		await assetTypeSelect.selectOption({ label: 'Cryptocurrency' });
		await balanceGroupSelect.selectOption({ label: 'Investments' });
		await symbolInput.fill('BTC');
		await quantityInput.fill('0.25');
		await costInput.fill('10000');
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('button.table__sortable', { hasText: 'Quantity' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Cost' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Symbol' })).toBeVisible();
		await expect(page.locator('button.table__sortable', { hasText: 'Marked as' })).not.toBeVisible(); // prettier-ignore
		expect(page.locator('td.table__td', { hasText: 'Bitcoin' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'Cryptocurrency' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: 'BTC' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '0.25' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$10,000.00' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '$2,500.00' })).toBeVisible;
		expect(await tableRows.count()).toBe(2);

		// Check "Marked as" column is visible only when there is at least one "Sold" asset
		await page.locator('a', { hasText: '1998 Fiat Multipla' }).click();
		await isSoldCheckbox.check();
		await page.locator('button', { hasText: 'Save' }).click();
		await expect(page.locator('button.table__sortable', { hasText: 'Marked as' })).toBeVisible();
		expect(page.locator('td.table__td', { hasText: 'Sold' })).toBeVisible;
		expect(page.locator('td.table__td', { hasText: '~' })).toBeVisible;
	});

	test('Asset page displays balance history chart correctly', async ({
		baseURL,
		page
	}, testInfo) => {
		setSnapshotPath(testInfo);
		await databaseSeed(baseURL!);

		await page.goto('/');
		await page.locator('a', { hasText: 'Assets' }).click();
		const chart = page.locator('.chart canvas');

		// Other asset
		await page.locator('a', { hasText: '1998 Fiat Multipla' }).click();
		await chart.hover();
		expect(await chart.screenshot()).toMatchSnapshot({
			name: 'chart-asset-other-asset.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});

		// Investment
		await page.locator('a', { hasText: 'Assets' }).click();
		await page.locator('a', { hasText: 'Bitcoin' }).click();
		await chart.hover();
		expect(await chart.screenshot()).toMatchSnapshot({
			name: 'chart-asset-investment.png',
			maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO
		});
	});
});
