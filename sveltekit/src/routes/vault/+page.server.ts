import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import { validateVaultMigration, validateVaultSeed } from '$lib/helpers/prisma';

export const load = async () => {
	const isMigrated = await validateVaultMigration();
	const vaultPath = env.DATABASE_URL.split('file:')[1];

	// Can't continue if the vault is not migrated
	if (!isMigrated)
		return {
			vaultPath,
			error: "couldn't be migrated"
		};

	const isSeeded = await validateVaultSeed();

	// Can't continue if the vault is not migrated
	if (!isSeeded)
		return {
			vaultPath,
			error: "wasn't seeded correctly"
		};

	// Update the flag so we don't migrate again
	env.ELECTRON_SWITCHED_VAULT = 'false';

	// Redirect to `The big picture` because vault is migrated and seeded
	throw redirect(307, '/');
};
