import { expect, test } from '@playwright/test';

import { pb, POCKETBASE_DEFAULT_URL, POCKETBASE_SEED_DEFAULT_PASSWORD } from '$lib/pocketbase';
import { createVerifiedUniqueUser } from '$lib/seed/data/user';

test('authentication flow: redirects, invalid login, and user creation', async ({ page }) => {
	// Cannot see app pages without signing in
	await page.goto('/');
	await expect(page).toHaveURL('/auth');
	await expect(page.locator('h1').getByText('Sign in')).toBeVisible();
	await expect(page.getByText('The big picture')).not.toBeVisible();

	// Try to navigate to balance-sheet
	await page.goto('/balance-sheet');
	await expect(page).toHaveURL('/auth');
	await expect(page.locator('h1').getByText('Sign in')).toBeVisible();
	await expect(page.locator('.auth-message')).not.toBeVisible();

	// Attempt to login with non-existent user
	await page.getByLabel('Email').fill('incorrect@canutin.com');
	await page.getByLabel('Password').fill('qweasdzxc');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.locator('.auth-message')).toHaveText(
		'Incorrect email or password. Please check your credentials.'
	);

	// Create the user, then un-verify them
	const userAlice = await createVerifiedUniqueUser('alice');
	await pb.collection('users').update(userAlice.id, { verified: false });

	// Attempt to login with newly created (unverified) user
	await page.getByLabel('Email').fill(userAlice.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.locator('.auth-message')).toHaveText(
		'An admin must verify your account before you can sign in'
	);
});

test('verified user login, navigation, and sign out', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');

	// User can now sign in
	await page.goto('/auth');
	await page.getByLabel('Email').fill(userAlice.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('h1').getByText('The big picture')).toBeVisible();
	await expect(page.locator('h1').getByText('Balance sheet')).not.toBeVisible();
	await expect(page.getByText(userAlice.email)).toBeVisible();

	// Check there is no redirect to /auth
	await page.getByRole('link', { name: 'Balance sheet' }).click();
	await expect(page).toHaveURL('/balance-sheet');
	await expect(page.locator('h1').getByText('The big picture')).not.toBeVisible();
	await expect(page.locator('h1').getByText('Balance sheet')).toBeVisible();

	await page.reload();
	await expect(page.locator('h1').getByText('The big picture')).not.toBeVisible();
	await expect(page.locator('h1').getByText('Balance sheet')).toBeVisible();
	await expect(page).toHaveURL('/balance-sheet');

	// Sign out
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page.locator('h1').getByText('Sign in')).toBeVisible();
	await expect(page.locator('h1').getByText('The big picture')).not.toBeVisible();
	await expect(page).toHaveURL('/auth');
});

test('offline scenario', async ({ page, context }) => {
	const userAlice = await createVerifiedUniqueUser('alice');

	// Try to sign in while offline
	await page.goto('/auth');

	// Simulate offline scenario
	await context.setOffline(true);
	await page.getByLabel('Email').fill(userAlice.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();

	// Check for offline error message
	await expect(page.locator('.auth-message')).toHaveText(
		'Unable to connect to the server. Please check your internet connection.'
	);

	// Restore online state
	await context.setOffline(false);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL('/');
	await expect(page.locator('h1').getByText('The big picture')).toBeVisible();
});

test.skip('server URL persistence in localStorage', async ({ page }) => {
	const userAlice = await createVerifiedUniqueUser('alice');

	// Sign in
	await page.goto('/auth');
	await page.getByLabel('Email').fill(userAlice.email);
	await page.getByLabel('Password').fill(POCKETBASE_SEED_DEFAULT_PASSWORD);
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL('/');

	// Check initial localStorage value
	const initialServerUrl = await page.evaluate(() => localStorage.getItem('serverUrl'));
	expect(initialServerUrl).toBe(JSON.stringify(POCKETBASE_DEFAULT_URL));

	// Change server URL
	const NEW_SERVER_URL = 'https://demo.canutin.com';
	await page.evaluate((url) => {
		localStorage.setItem('serverUrl', JSON.stringify(url));
	}, NEW_SERVER_URL);

	// Reload the page
	await page.reload();

	// Check if the new server URL persists
	const persistedServerUrl = await page.evaluate(() => localStorage.getItem('serverUrl'));
	expect(persistedServerUrl).toBe(JSON.stringify(NEW_SERVER_URL));

	// When localStorage changes an event is fired that clears the current instance of PocketBaseClient
	await expect(page).toHaveURL('/auth');
	await expect(page.locator('.auth-message')).toHaveText(
		'Unable to connect to the server. Please check your internet connection.'
	);
});
