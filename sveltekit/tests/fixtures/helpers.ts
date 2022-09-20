import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { DeveloperFunctions } from '../../src/lib/helpers/constants.js';
import { expect, type BrowserContext } from '@playwright/test';

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

export const setLastUpdateCheck = async (
	baseUrl: string,
	context: BrowserContext,
	time?: string
) => {
	const storage = await context.storageState();

	// If `time` is not provided, it defaults to the current time
	const setTime = time ? time : (Date.now() / 1000).toString();

	// Set localStorage as if updates were recently checked for
	storage.origins.push({
		origin: baseUrl,
		localStorage: [
			{
				name: 'lastUpdateCheck',
				value: setTime
			}
		]
	});
	const currentLocalStorage = storage.origins[0]?.localStorage[0];
	expect(currentLocalStorage).not.toBeUndefined();
	expect(JSON.stringify(currentLocalStorage)).toMatch('lastUpdateCheck');
	expect(JSON.stringify(currentLocalStorage)).toMatch(setTime);
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
