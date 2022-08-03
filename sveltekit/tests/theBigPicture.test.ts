import { expect, test } from '@playwright/test';
import { checkVaultIsDev, wipeVault } from './fixtures/helpers.js';

test.skip('Balance sheet', () => {
	test.beforeAll(() => {
		checkVaultIsDev();
	});

	test.beforeEach(async () => {
		await wipeVault();
	});

	test('Summary totals are calculated correctly', async ({ page }) => {
		// TODO
	});
});
