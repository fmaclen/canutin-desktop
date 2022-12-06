import { getUnixTime } from 'date-fns';
import { type PlaywrightTestConfig, devices } from '@playwright/test';
import { pathToTestVault } from './tests/fixtures/helpers.js';

const isEnvCI = process.env.NODE_ENV === 'CI';
const browser = process.env.BROWSER;
const projectBrowser = [
	{
		name: browser,
		use: { ...devices[`Desktop ${browser}`] }
	}
];

const config: PlaywrightTestConfig = {
	globalSetup: './tests/fixtures/global-setup.ts',
	retries: isEnvCI ? 3 : 0,
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			IS_TEST: 'true', // Would have liked to use NODE_ENV=test but it gets overwritten to `development`
			SHOULD_CHECK_VAULT: 'true',
			DATABASE_URL: `file:${pathToTestVault}`,
			APP_VERSION: 'v0.0.0-test'
		}
	},
	use: {
		trace: isEnvCI ? 'off' : 'retain-on-failure',
		screenshot: isEnvCI ? 'off' : 'only-on-failure',
		storageState: {
			cookies: [],
			origins: [
				{
					origin: 'http://localhost:4173',
					localStorage: [
						{
							name: 'lastUpdateCheck',
							value: getUnixTime(new Date()).toString()
						}
					]
				}
			]
		}
	},
	projects: isEnvCI ? projectBrowser : undefined,
	// Can't have more than 1 worker because the tests read/write to the same DB at the same time
	workers: 1
};

export default config;
