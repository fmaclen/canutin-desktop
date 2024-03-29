import { json } from '@sveltejs/kit';

import canutinFileFixture from '../../../tests/fixtures/canutinFile-maximum-data.json';

import prisma from '$lib/helpers/prisma.server';
import seedDemoData from '$lib/seed';
import { env } from '$env/dynamic/private';
import { isEnvTest } from '$lib/helpers/tests.server';
import {
	Appearance,
	DeveloperFunctions,
	UNAUTHORIZED_RESPONSE_MESSAGE,
	UNAUTHORIZED_RESPONSE_STATUS
} from '$lib/helpers/constants';
import {
	createErrorEvent,
	createLoadingEvent,
	createSuccessEvent,
	markEventAsRead
} from '$lib/helpers/events.server';
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

	// Don't create events in tests (except if it's from the devTools tests)
	const shouldCreateEvent = (isEnvTest() && env.TEST_DEV_TOOLS === 'true') || !isEnvTest();

	switch (functionType) {
		case DeveloperFunctions.DB_WIPE_TRANSACTIONS:
			await wipeTransactions();
			shouldCreateEvent &&
				(await createSuccessEvent('All transactions have been deleted', Appearance.ACTIVE));
			break;

		case DeveloperFunctions.DB_WIPE_ACCOUNTS_ASSETS:
			await wipeAccountsAssets();
			shouldCreateEvent && await createSuccessEvent('All accounts, transactions & assets have been deleted', Appearance.ACTIVE); // prettier-ignore
			break;

		case DeveloperFunctions.DB_WIPE:
			await wipeAccountsAssets();
			await prisma.setting.deleteMany();
			await prisma.event.deleteMany();
			shouldCreateEvent &&
				(await createSuccessEvent('Database was wiped successfully', Appearance.ACTIVE));
			break;

		case DeveloperFunctions.DB_SEED: {
			const processingEvent = shouldCreateEvent
				? await createLoadingEvent('Seeding database')
				: undefined;
			try {
				await seedDemoData();
				shouldCreateEvent && (await createSuccessEvent('Database was seeded successfully'));
			} catch (_e) {
				shouldCreateEvent && (await createErrorEvent('Database could not be seeded'));
			}
			processingEvent && (await markEventAsRead(processingEvent.id));
			break;
		}

		case DeveloperFunctions.DB_SET_URL: {
			const dbUrlParam = url.searchParams.get('dbUrl');
			const dbUrl = dbUrlParam ? dbUrlParam : env.DATABASE_URL;

			setEnvironmentVariable('SHOULD_CHECK_VAULT', 'true');
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
	// Check if the request has cookies and authorization headers set
	const cookieHeader = request.headers.get('cookie');
	const hasCookies = cookieHeader !== null && cookieHeader !== '';
	const authorizationHeader = request.headers.get('authorization');
	const hasJwtBearer =
		authorizationHeader !== null &&
		authorizationHeader !== '' &&
		authorizationHeader.includes('Bearer');

	// First check if the request is not coming from a test
	if (!isEnvTest() || !hasCookies || !hasJwtBearer)
		return new Response(UNAUTHORIZED_RESPONSE_MESSAGE, UNAUTHORIZED_RESPONSE_STATUS);

	// Return a valid CanutinFile response
	return json(canutinFileFixture as CanutinFile);
};
