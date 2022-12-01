import { json } from '@sveltejs/kit';

import canutinFileFixture from '../../../tests/fixtures/canutinFile-maximum-data.json';

import prisma from '$lib/helpers/prisma';
import seedDemoData from '$lib/seed';
import { env } from '$env/dynamic/private';
import { isEnvTest } from '$lib/helpers/tests.server';
import { DeveloperFunctions } from '$lib/helpers/constants';
import type { CanutinFile } from '$lib/helpers/import';

const getFunctionType = (url: URL) => {
	const functionTypeParam = url.searchParams.get('functionType');
	return functionTypeParam && parseInt(functionTypeParam);
};

export const POST = async ({ url }: { url: URL }) => {
	const functionType = getFunctionType(url);

	const setEnvironmentVariable = (name: string, value: string) => {
		// Don't allow setting environment variables unless it's in the context of a test
		if (!isEnvTest() && env.TEST_ACCESS_KEY !== 'true') return;

		process.env[`${name}`] = value;
		env[`${name}`] = value;
	};

	const wipeAccountsAssets = async () => {
		await prisma.account.deleteMany();
		await prisma.asset.deleteMany();
	};

	const wipeTransactions = async () => {
		await prisma.transaction.deleteMany();
	};

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE_TRANSACTIONS:
			await wipeTransactions();
			break;

		case DeveloperFunctions.DB_WIPE_ACCOUNTS_ASSETS:
			await wipeAccountsAssets();
			break;

		case DeveloperFunctions.DB_WIPE:
			await wipeAccountsAssets();
			await prisma.setting.deleteMany();
			break;

		case DeveloperFunctions.DB_SEED:
			await seedDemoData();
			break;

		case DeveloperFunctions.DB_SET_URL: {
			const dbUrlParam = url.searchParams.get('dbUrl');
			const dbUrl = dbUrlParam ? dbUrlParam : env.DATABASE_URL;

			setEnvironmentVariable('ELECTRON_SWITCHED_VAULT', 'true');
			dbUrl && setEnvironmentVariable('DATABASE_URL', dbUrl);
			break;
		}

		case DeveloperFunctions.SET_ENV_VARIABLE: {
			const envVariableNameParam = url.searchParams.get('envVariableName');
			const envVariableValueParam = url.searchParams.get('envVariableValue');

			if (envVariableNameParam && envVariableValueParam)
				setEnvironmentVariable(envVariableNameParam, envVariableValueParam);
			break;
		}
	}

	return new Response(undefined);
};

// This endpoint returns a fake CanutinFile response and it's meant to be used in tests
export const GET = async ({ request, url }: { request: Request; url: URL }) => {
	// Check if the request is coming from a test
	const functionType = getFunctionType(url);
	const isTestRequest = functionType === DeveloperFunctions.CANUTIN_FILE_SYNC_TEST;

	// Check if the request has cookies and authorization headers set
	const cookieHeader = request.headers.get('cookie');
	const hasCookies = cookieHeader !== null && cookieHeader !== '';
	const authorizationHeader = request.headers.get('authorization');
	const hasJwtBearer =
		authorizationHeader !== null &&
		authorizationHeader !== '' &&
		authorizationHeader.includes('Bearer');

	if (!isTestRequest || !hasCookies || !hasJwtBearer)
		return json({ error: 'Not authorized' }, { status: 401 });

	// Return a valid CanutinFile response
	return json(canutinFileFixture as CanutinFile);
};
