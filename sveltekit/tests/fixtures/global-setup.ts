import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { expect } from '@playwright/test';

const globalSetup = () => {
	// Create a temporary vault for the tests
	const vaultTestPath = path.join(process.cwd(), 'tests', 'tmp', 'Canutin.vault.test');

	if (fs.existsSync(vaultTestPath)) fs.unlinkSync(vaultTestPath);
	expect(fs.existsSync(vaultTestPath)).toBe(false);

	execSync(`npx prisma migrate dev`, {
		env: {
			...process.env,
			DATABASE_URL: `file:${vaultTestPath}`
		},
		stdio: 'inherit'
	});

	expect(fs.existsSync(vaultTestPath)).toBe(true);
};

export default globalSetup;
