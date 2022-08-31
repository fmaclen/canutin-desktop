import path from 'path';
import fs from 'fs';
import fetch from 'node-fetch';
import { DeveloperFunctions } from '../../src/lib/helpers/constants.js';

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

export const importCanutinFile = async (baseUrl: string, fixtureName: string) => {
	const canutinFile = fs.readFileSync(
		path.join(process.cwd(), 'tests', 'fixtures', `canutinFile-${fixtureName}.json`)
	);
	await fetch(`${baseUrl}/import.json`, {
		body: canutinFile,
		...methodAndHeaders
	});
};
