import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	use: {
		headless: true,
		trace: 'off'
		// trace: 'retain-on-failure' // uncomment to see use TraceViewer when a test fails
	},
	// Can't have more than 1 worker because the tests read/write to the same DB at the same time
	workers: 1
};

export default config;
