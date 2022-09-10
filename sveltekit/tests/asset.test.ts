import { expect, test } from '@playwright/test';
import { databaseWipe } from './fixtures/helpers.js';

test.describe('Asset', () => {
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

		const balanceItem = page.locator('.balanceSheet__item');
		expect(await balanceItem.count()).toBe(0);

		// Add a new asset of type "Security" (which is `isQuantifiable`)
		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();
		await expect(page.locator('button', { hasText: 'Add' })).toBeDisabled();
		expect(await page.locator('.formInput__input[name=symbol]').count()).toBe(0);

		await page.locator('.formInput__input[name=name]').fill('GameStop');
		await page.locator('.formSelect__select[name=assetTypeId]').selectOption({ label: 'Security' });
		await page
			.locator('.formSelect__select[name=balanceGroup]')
			.selectOption({ label: 'Investments' });
		expect(await page.locator('.formInput__input[name=symbol]').count()).toBe(1);
		await expect(page.locator('button', { hasText: 'Add' })).not.toBeDisabled();
		await expect(page.locator('section', { hasText: 'Details' })).toBeVisible();
		await expect(page.locator('section', { hasText: 'Current balance' })).not.toBeVisible();

		await page.locator('.formInput__input[name=symbol]').fill('GME');
		const statusBar = page.locator('.statusBar');
		await expect(statusBar).not.toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).not.toMatch('The asset was added successfully');

		await page.locator('button', { hasText: 'Add' }).click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch('The asset was added successfully');
		await expect(page.locator('section', { hasText: 'Details' })).toBeVisible();
		await expect(page.locator('h1', { hasText: 'GameStop' })).toBeVisible();
		await expect(page.locator('.formInput__input[name=name]')).toHaveValue('GameStop');
		await expect(page.locator('.formInput__input[name=symbol]')).toHaveValue('GME');
		expect(await page.locator('.formSelect__select[name=assetTypeId]').textContent()).toMatch(
			'Security'
		);
		expect(await page.locator('.formSelect__select[name=balanceGroup]').textContent()).toMatch(
			'Investments'
		);
		await expect(page.locator('section', { hasText: 'Current balance' })).toBeVisible();

		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await balanceItem.textContent()).toMatch('GameStop');
		expect(await balanceItem.textContent()).toMatch('$0');
		expect(await balanceItem.count()).toBe(1);

		// Check that the asset's current balance can be updated
		await page.locator('a', { hasText: 'GameStop' }).click();
		await page.locator('.formInput__input[name=quantity]').fill('4.20');
		await page.locator('.formInput__input[name=cost]').fill('69');
		await expect(page.locator('.formInput__input[name=value]')).toBeDisabled();
		await expect(page.locator('.formInput__input[name=value]')).toHaveValue('289.8');
		expect(await statusBar.textContent()).not.toMatch(
			"The asset's balance was updated successfully"
		);

		await page.locator('button', { hasText: 'Save' }).first().click();
		await expect(statusBar).toHaveClass(/statusBar--positive/);
		expect(await statusBar.textContent()).toMatch("The asset's balance was updated successfully");

		await page.locator('a', { hasText: 'Balance sheet' }).click();
		expect(await balanceItem.textContent()).toMatch('GameStop');
		expect(await balanceItem.textContent()).toMatch('$290');

		await page.locator('a', { hasText: 'GameStop' }).click();
		await expect(page.locator('.formInput__input[name=quantity]')).toBeVisible();
		await expect(page.locator('.formInput__input[name=cost]')).toBeVisible();
		await expect(page.locator('.formInput__input[name=symbol]')).toBeVisible();

		// Check that the asset's available fields change when the type is one that's not "quantifiable"
		await page.locator('.formSelect__select[name=assetTypeId]').selectOption({ label: 'Business' });
		await page
			.locator('.formSelect__select[name=balanceGroup]')
			.selectOption({ label: 'Other assets' });
		await expect(page.locator('.formInput__input[name=symbol]')).not.toBeVisible();
		await expect(page.locator('.formInput__input[name=quantity]')).toBeVisible();
		await expect(page.locator('.formInput__input[name=cost]')).toBeVisible();

		const isSoldCheckbox = page.locator('.formInputCheckbox__input[name=isSold]');
		await expect(isSoldCheckbox).not.toBeChecked();

		await isSoldCheckbox.check();
		await page.locator('button', { hasText: 'Save' }).nth(1).click();
		await expect(page.locator('.formInput__input[name=value]')).not.toBeDisabled();
		await expect(page.locator('.formInput__input[name=symbol]')).not.toBeVisible();
		await expect(page.locator('.formInput__input[name=quantity]')).not.toBeVisible();
		expect(await page.locator('.formSelect__select[name=assetTypeId]').textContent()).toMatch(
			'Business'
		);
		expect(await page.locator('.formSelect__select[name=balanceGroup]').textContent()).toMatch(
			'Other assets'
		);
		await expect(isSoldCheckbox).toBeChecked();
		await expect(page.locator('.formInput__input[name=value]')).toHaveValue('289.8');
		await expect(page.locator('.formInput__input[name=cost]')).not.toBeVisible();

		// Another asset with the same name can't be created
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

		await page.locator('.formInput__input[name=name]').fill('GameStop');
		await page.locator('.formSelect__select[name=assetTypeId]').selectOption({ label: 'Currency' });
		await page.locator('.formSelect__select[name=balanceGroup]').selectOption({ label: 'Cash' });
		await page.locator('button', { hasText: 'Add' }).click();
		await expect(page.locator('.formInput__error')).toBeVisible();
		expect(await page.locator('.formInput__error').textContent()).toMatch(
			'An asset with the same name already exists'
		);
	});
});
