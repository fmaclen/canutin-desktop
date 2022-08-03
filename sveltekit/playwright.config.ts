import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	use: {
		headless: true,
		trace: 'off'
		// trace: 'retain-on-failure'
	},
	workers: 1
};

export default config;
