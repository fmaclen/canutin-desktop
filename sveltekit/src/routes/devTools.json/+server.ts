import prisma from '$lib/helpers/prisma';
import seedDemoData from '$lib/seed';
import { DeveloperFunctions } from '$lib/helpers/constants';
import { env } from '$env/dynamic/private';

export const POST = async ({ url }: { url: URL }) => {
	const functionTypeParam = url.searchParams.get('functionType');
	const functionType = functionTypeParam && parseInt(functionTypeParam);

	const dbUrlParam = url.searchParams.get('dbUrl');
	const dbUrl = dbUrlParam ? dbUrlParam : env.DATABASE_URL;

	const envVariableNameParam = url.searchParams.get('envVariableName');
	const envVariableValueParam = url.searchParams.get('envVariableValue');

	const setEnvironmentVariable = (name: string, value: string) => {
		// Don't allow setting environment variables unless it's part of a test
		if (process.env.NODE_ENV && ['CI', 'test'].includes(process.env.NODE_ENV)) return;

		process.env[`${name}`] = value;
		env[`${name}`] = value;
	};

	const wipeAccountsAssets = async () => {
		await prisma.account.deleteMany();
		await prisma.asset.deleteMany();
	};

	switch (functionType) {
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

		case DeveloperFunctions.DB_SET_URL:
			setEnvironmentVariable('ELECTRON_SWITCHED_VAULT', 'true');
			dbUrl && setEnvironmentVariable('DATABASE_URL', dbUrl);
			break;

		case DeveloperFunctions.SET_ENV_VARIABLE:
			envVariableNameParam &&
				envVariableValueParam &&
				setEnvironmentVariable(envVariableNameParam, envVariableValueParam);
			break;
	}

	return new Response(undefined);
};
