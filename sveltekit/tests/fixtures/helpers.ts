import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { DeveloperFunctions } from '../../src/lib/helpers/constants.js';
import type { TestInfo } from '@playwright/test';

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
// snapshot as the source and allow the other scenarios to have a 5% pixel variance:
export const MAX_DIFF_PIXEL_RATIO = 0.05;

// Playwright renames snapshots to match the current OS and browser, so we need to
// update the test configuration so it always matches the macOS + Chromium snapshot.
// REF: https://github.com/microsoft/playwright/issues/7575#issuecomment-1240566545
export const setSnapshotPath = (testInfo: TestInfo) => {
	testInfo.snapshotPath = (name: string) => `${testInfo.file}-snapshots/${name}`;
};
