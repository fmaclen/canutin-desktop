import path from 'path';
import fs from 'fs';
import { expect, type Page, type TestInfo } from '@playwright/test';

import { Appearance, DeveloperFunctions } from '../../src/lib/helpers/constants.js';

// Waits for the caret position update in `@canutin/sveltekit-currency-input`
export const DELAY_FOR_DECIMAL_VALUES_IN_MS = 25;

export const pathToTestVault = path.join(process.cwd(), 'tests', 'tmp', 'Canutin.vault.test');

const methodAndHeaders = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
};

export const databaseWipe = async (baseUrl: string) => {
	await fetch(`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.DB_WIPE}`, {
		...methodAndHeaders
	});
};

export const databaseSeed = async (baseUrl: string) => {
	await fetch(`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.DB_SEED}`, {
		...methodAndHeaders
	});
};

export const databaseSetUrl = async (baseUrl: string, dbUrl = `file:${pathToTestVault}`) => {
	await fetch(
		`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.DB_SET_URL}&dbUrl=${dbUrl}`,
		{
			...methodAndHeaders
		}
	);
};

export const setEnvironmentVariable = async (
	baseUrl: string,
	envVariableName: string,
	envVariableValue: string
) => {
	await fetch(
		`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.SET_ENV_VARIABLE}&envVariableName=${envVariableName}&envVariableValue=${envVariableValue}`,
		{
			...methodAndHeaders
		}
	);
};

export const importCanutinFile = async (baseUrl: string, fixtureName: string) => {
	const canutinFile = fs.readFileSync(
		path.join(process.cwd(), 'tests', 'fixtures', `canutinFile-${fixtureName}.json`)
	);
	await fetch(`${baseUrl}/import.json`, {
		body: canutinFile,
		...methodAndHeaders
	});
};

export const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// NOTE: Our current testing setup runs on Windows, Linux and macOS.
// On each OS we also run the tests in Chromium, Firefox and Webkit.
// To run pixel perfect visual regression tests we would need dedicated snapshots
// for each OS and browser combination so to simplify things we use the macOS + Chromium
// snapshot as the source and allow the other scenarios to have a 7.5% pixel variance:
export const MAX_DIFF_PIXEL_RATIO = 0.075;

// Playwright renames snapshots to match the current OS and browser, so we need to
// update the test configuration so it always matches the macOS + Chromium snapshot.
// REF: https://github.com/microsoft/playwright/issues/7575#issuecomment-1240566545
export const setSnapshotPath = (testInfo: TestInfo) => {
	testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
};

export const expectToastAndDismiss = async (
	page: Page,
	message: string,
	appearance?: Appearance
) => {
	const toast = page.locator('.toastLi', { hasText: message });
	await expect(toast).toBeVisible();

	switch (appearance) {
		case Appearance.ACTIVE:
			await expect(toast).toHaveClass(/toastLi--active/);
			break;
		case Appearance.NEGATIVE:
			await expect(toast).toHaveClass(/toastLi--negative/);
			break;
		case Appearance.POSITIVE:
			await expect(toast).toHaveClass(/toastLi--positive/);
			break;
		default:
			await expect(toast).not.toHaveClass(/toastLi--/);
	}

	// Events that have a loading state will not have a dismiss button
	const isDismissable = !(await toast.locator('.toastLoadingMsg__icon').isVisible());
	if (isDismissable) {
		const toastDismissButton = toast.locator('._toastBtn');
		await toastDismissButton.click();
	}

	await expect(toast).not.toBeVisible();
};

export const prepareToAcceptDialog = async (page: Page, message: string) => {
	page.on('dialog', (dialog) => {
		expect(dialog.message()).toMatch(message);

		dialog.accept();
	});
};
