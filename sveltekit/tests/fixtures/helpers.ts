import fs from 'fs';
import fetch from 'node-fetch';
import { DeveloperFunctions } from '../../src/lib/helpers/constants.js';

const methodAndHeaders = {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	}
};

export const databaseWipe = async (baseUrl: string) => {
	process.env.DATABASE_URL = 'file:./Canutin.dev.vault';

	await fetch(`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.DB_WIPE}`, {
		...methodAndHeaders
	});
};

export const databaseSeed = async (baseUrl: string) => {
	await fetch(`${baseUrl}/devTools.json?functionType=${DeveloperFunctions.DB_SEED}`, {
		...methodAndHeaders
	});
};

export const importCanutinFile = async (baseUrl: string, fixtureName: string) => {
	const canutinFile = fs.readFileSync(`./tests/fixtures/canutinFile-${fixtureName}.json`);
	await fetch(`${baseUrl}/import.json`, {
		body: canutinFile,
		...methodAndHeaders
	});
};
