import { expect, test } from '@playwright/test';

import { createAsset } from '$lib/pocketbase';
import { assetCryptoBitcoinDetails, assetSecurityTeslaDetails } from '$lib/seed/data/assets';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('user can only see their own assets', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');
	const userBob = await createVerifiedUniqueUser('bob');

	await createAsset(userAlice.id, assetSecurityTeslaDetails);
	await createAsset(userBob.id, assetCryptoBitcoinDetails);

	await signInAsUser(page, userAlice);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).not.toBeVisible();
	await expect(page.getByText('Tesla')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, userBob);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).toBeVisible();
	await expect(page.getByText('Tesla')).not.toBeVisible();
});
