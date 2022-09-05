import type { PlaywrightTestConfig } from '@playwright/test';
import { pathToTestVault } from './tests/fixtures/helpers.js';

const config: PlaywrightTestConfig = {
	globalSetup: './tests/fixtures/global-setup.ts',
	retries: 3,
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		env: {
			ELECTRON_SWITCHED_VAULT: 'true',
			DATABASE_URL: `file:${pathToTestVault}`,
			APP_VERSION: '4.2.0-next.69'
		}
	},
	use: {
		headless: true,
		trace: 'off'
		// trace: 'retain-on-failure', // uncomment to see use TraceViewer when a test fails
		// screenshot: 'only-on-failure' // uncomment to see screenshots when a test fails
	},
	// Can't have more than 1 worker because the tests read/write to the same DB at the same time
	workers: 1
};

export default config;
