import { expect, test } from '@playwright/test';

import { createAsset, createAssetBalanceStatements } from '$lib/pocketbase';
import {
	assetCryptoBitcoinDetails,
	assetSecurityGamestopDetails,
	assetSecurityTeslaDetails
} from '$lib/seed/data/assets';
import { assetGamestopBalanceStatements } from '$lib/seed/data/balanceStatements';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

import { signInAsUser } from './utils';

test('user can only see their own assets', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');
	const pbBob = await createVerifiedUniqueUser('bob');

	await createAsset(pbAlice, assetSecurityTeslaDetails);
	await createAsset(pbBob, assetCryptoBitcoinDetails);

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).not.toBeVisible();
	await expect(page.getByText('Tesla')).toBeVisible();

	await page.getByText('Sign out').click();
	await signInAsUser(page, pbBob);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('Bitcoin')).toBeVisible();
	await expect(page.getByText('Tesla')).not.toBeVisible();
});

test('assets context is updated in real-time', async ({ page }) => {
	const pbAlice = await createVerifiedUniqueUser('alice');

	await signInAsUser(page, pbAlice);
	await page.locator('nav a', { hasText: 'Assets' }).click();
	await expect(page.locator('h1', { hasText: 'Assets' })).toBeVisible();
	await expect(page.getByText('GameStop')).not.toBeVisible();

	const assetGameStop = await createAsset(pbAlice, assetSecurityGamestopDetails);
	const assetRow = page.locator('tbody tr', { hasText: 'GameStop' });
	await expect(assetRow).toBeVisible();
	await expect(assetRow).toContainText('$0');

	await createAssetBalanceStatements(
		pbAlice,
		assetGameStop.id,
		assetGamestopBalanceStatements.slice(0, 1)
	);
	await expect(assetRow).toContainText('$3,125');
});
