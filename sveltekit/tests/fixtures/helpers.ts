import fs from 'fs';
import fetch from 'node-fetch';
import { PrismaClient } from '@prisma/client';

export const checkVaultIsDev = () => {
	// Tests will delete all the data in the current database set by DATABASE_URL
	// so we need to check that we are operating on the development vault.
	const DEV_VAULT = 'file:./Canutin.dev.vault';
	const dbUrl = process.env.DATABASE_URL;
	if (dbUrl !== DEV_VAULT)
		throw new Error(`
			Expected "DATABASE_URL" to be "${DEV_VAULT}" but instead it is: "${dbUrl}"
		`);
};

const prisma = new PrismaClient();
export const wipeVault = async () => {
	// Wipe the database before each test
	await prisma.account.deleteMany({});
	await prisma.asset.deleteMany({});
};

export const importCanutinFile = async (baseUrl: string, fixtureName: string) => {
	const canutinFile = fs.readFileSync(`./tests/fixtures/canutinFile-${fixtureName}.json`);
	const result = await fetch(`${baseUrl}/import.json`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: canutinFile
	});
	return result.json();
};
