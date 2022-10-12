import { expect, test } from '@playwright/test';
import { databaseSeed, databaseWipe, delay } from './fixtures/helpers.js';

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
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('The asset was added successfully');

		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('The asset was added successfully');

		// Check the asset was created successfully
		await page.locator('button', { hasText: 'Dismiss' }).click();
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
		await page.keyboard.type('69');
		await expect(valueInput).toBeDisabled();
		await expect(valueInput).toHaveValue('$289.8');
		expect(await statusBar.textContent()).not.toMatch('The asset was updated successfully');

		await page.locator('button', { hasText: 'Save' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('The asset was updated successfully');

		// Check the account was updated successfully
		await page.locator('button', { hasText: 'Dismiss' }).click();
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
		const inputError = page.locator('.formInput__error');
		await expect(inputError).not.toBeVisible();

		await nameInput.fill('GameStop');
		await page.locator('button', { hasText: 'Dismiss' }).click();
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(inputError).toBeVisible();
		expect(await inputError.textContent()).toMatch('An asset with the same name already exists');
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('The asset was added successfully');

		// Check an asset can't be edited to have the same name as another asset
		await nameInput.fill('AMC Entertainment Holdings Inc');
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('The asset was added successfully');

		await page.locator('a', { hasText: 'AMC Entertainment Holdings Inc' }).click();
		await expect(page.locator('h1', { hasText: 'AMC Entertainment Holdings Inc' })).toBeVisible();

		// Rename using an existing asset name
		await nameInput.fill('GameStop');
		await expect(inputError).not.toBeVisible();

		await page.locator('button', { hasText: 'Save' }).click();
		expect(await inputError.textContent()).toMatch('An asset with the same name already exists');
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
		expect(await page.locator('p.danger-zone__p').first().textContent()).toBe(
			'Permanently delete asset 1998 Fiat Multipla'
		);

		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--active/);
		expect(await statusBar.textContent()).not.toMatch(
			'The asset "1998 Fiat Multipla" was deleted successfully'
		);

		// Prepare to confirm the dialog prompt
		page.on('dialog', (dialog) => {
			expect(dialog.message()).toMatch('Are you sure you want to delete the asset?');

			dialog.accept();
		});

		// Proceed to delete asset
		await page.locator('button', { hasText: 'Delete' }).click();

		// Check status message confirms asset deletion
		await expect(statusBar).toHaveClass(/statusBar--active/);
		expect(await statusBar.textContent()).toMatch(
			'The asset —1998 Fiat Multipla— was deleted successfully'
		);

		// Check the asset is no longer present in Balance sheeet
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await expect(assetLink).not.toBeVisible();
	});
});
