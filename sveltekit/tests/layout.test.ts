import { expect, test } from '@playwright/test';

test.describe('Layout', () => {
	test('Sidebar renders correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();

		const sidebarBigPicture = page.locator('a', { hasText: 'The big picture' });
		await expect(sidebarBigPicture).toHaveAttribute('href', '/');
		await expect(sidebarBigPicture).toHaveClass(/layout__a--active/);

		const sidebarBalanceSheet = page.locator('a:has-text("Balance sheet")');
		await expect(sidebarBalanceSheet).toHaveAttribute('href', '/balanceSheet');
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);

		await sidebarBalanceSheet.click();
		await expect(page.locator('h1', { hasText: 'Balance sheet' })).toBeVisible();
		await expect(sidebarBigPicture).not.toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).toHaveClass(/layout__a--active/);

		const sidebarAddOrUpdateData = page.locator('a', { hasText: 'Add or update data' });
		await expect(sidebarAddOrUpdateData).toHaveAttribute('href', '/dataIngest');
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a/);
		await expect(sidebarAddOrUpdateData).not.toHaveClass(/layout__a--active/);

		await sidebarAddOrUpdateData.click();
		await expect(page.locator('h1', { hasText: 'Add or update data' })).toBeVisible();
		await expect(sidebarAddOrUpdateData).toHaveClass(/layout__a--active/);
		await expect(sidebarBalanceSheet).not.toHaveClass(/layout__a--active/);
	});

	test('Default settings are rendered correctly', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1', { hasText: 'The big picture' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'USD $' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: 'English' })).toBeVisible();
		await expect(page.locator('p.layout__tag', { hasText: '4.2.0-next.69' })).toBeVisible(); // `APP_VERSION` is set in `playwright.config.ts`
	});

	test('Error pages', async ({ page }) => {
		// Error 404
		await page.goto('/not-found');
		await expect(page.locator('h1', { hasText: 'Not found' })).toBeVisible();
		expect(await page.locator('p.notice').textContent()).toMatch(
			"No content found. Perhaps there's a typo in the address or followed a broken link"
		);
		await expect(page.locator('p.errorMessage')).not.toBeVisible();

		// Error 500
		// This tests runs against the production build so we can't trigger a internal
		// server error but in `dev` we can by visiting `/500` which intercetps what
		// would have been a 404 and throws an intentional error.
		//
		// The test below is running negative assertions against a 404 to make sure
		// an error 500 can't occur by visiting `/500` in production.
		await page.goto('/500');
		await expect(page.locator('h1', { hasText: 'Something went wrong' })).not.toBeVisible();
		expect(await page.locator('p.notice').textContent()).not.toMatch(
			"An error ocurred and whatever was happening likely didn't finish succesfully"
		);
		await expect(
			page.locator('p.errorMessage', {
				hasText:
					'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
			})
		).not.toBeVisible();
	});

	test('Currency field behavior is correct', async ({ page }) => {
		await page.goto('/');
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await page.locator('a', { hasText: 'Add account' }).click();
		await expect(page.locator('h1', { hasText: 'Add account' })).toBeVisible();

		const valueHiddenInput = page.locator('.formInput__input[type=hidden][name=value]');
		const valueInput = page.locator('.formInput__currency[name=currencyValue]');
		await expect(valueHiddenInput).toHaveValue('0');
		await expect(valueInput).toHaveValue('');
		await expect(valueInput).toHaveAttribute('placeholder', '$0.00');
		await expect(valueInput).not.toHaveClass(/formInput__currency--positive/);
		await expect(valueInput).not.toHaveClass(/formInput__currency--negative/);
		await expect(valueInput).toHaveClass(/formInput__currency--zero/);

		await valueInput.focus();
		await page.keyboard.type('420.69');
		await expect(valueInput).toHaveValue('$420.69');
		await expect(valueHiddenInput).toHaveValue('420.69');
		await expect(valueInput).toHaveClass(/formInput__currency--positive/);
		await expect(valueInput).not.toHaveClass(/formInput__currency--negative/);
		await expect(valueInput).not.toHaveClass(/formInput__currency--zero/);

		// Use arrow keys to go back to the first character
		for (let i = 0; i < '$420.69'.length; i++) await page.keyboard.press('ArrowLeft');
		await page.keyboard.type('-');
		await expect(valueInput).toHaveValue('-$420.69');
		await expect(valueHiddenInput).toHaveValue('-420.69');
		await expect(valueInput).not.toHaveClass(/formInput__currency--positive/);
		await expect(valueInput).toHaveClass(/formInput__currency--negative/);
		await expect(valueInput).not.toHaveClass(/formInput__currency--zero/);

		// Use right arrow keys to position cusror at the end of the input
		for (let i = 0; i < '$420.69'.length; i++) await page.keyboard.press('ArrowRight');
		// Delete the number but keep the currency symbol and sign
		for (let i = 1; i < '420.69'.length; i++) await page.keyboard.press('Backspace');
		await expect(valueInput).toHaveValue('-$');
		// FIXME: at this point the hidden value should be set to 0 but without formatting `valueInput`
		await expect(valueHiddenInput).toHaveValue('-4');

		await page.keyboard.press('Backspace');
		await expect(valueInput).toHaveValue('-');
		// FIXME: at this point the hidden value should be set to 0 but without formatting `valueInput
		await expect(valueHiddenInput).toHaveValue('-4');

		await page.keyboard.type('69.42');
		await expect(valueInput).toHaveValue('-$69.42');
		await expect(valueHiddenInput).toHaveValue('-69.42');

		for (let i = 0; i < '-$69.42'.length; i++) await page.keyboard.press('Backspace');
		await expect(valueHiddenInput).toHaveValue('0');

		// Check currency fields where negative values are not allowed
		await page.locator('a', { hasText: 'Balance sheet' }).click();
		await page.locator('a', { hasText: 'Add asset' }).click();
		await expect(page.locator('h1', { hasText: 'Add asset' })).toBeVisible();

		const assetTypeSelect = page.locator('.formSelect__select[name=assetTypeId]');
		const costInput = page.locator('.formInput__currency[name=currencyCost]');
		const costHiddenInput = page.locator('.formInput__input[type=hidden][name=cost]');
		await assetTypeSelect.selectOption({ label: 'Security' });
		await expect(costInput).toBeVisible();

		await costInput.focus();
		await page.keyboard.type('-420.69');
		await expect(costInput).toHaveValue('$420.69');
		await expect(costHiddenInput).toHaveValue('420.69');
		await expect(costInput).not.toHaveClass(/formInput__currency--positive/);
		await expect(costInput).not.toHaveClass(/formInput__currency--negative/);
		await expect(costInput).not.toHaveClass(/formInput__currency--zero/);
	});
});
