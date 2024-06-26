import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

import { validateVaultMigration, validateVaultSeed } from '$lib/helpers/prisma.server';

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

	// Can't continue if the vault is not seeded
	if (!isSeeded)
		return {
			vaultPath,
			error: "wasn't seeded correctly"
		};

	// Update the flag so we don't migrate again
	env.SHOULD_CHECK_VAULT = 'false';

	// Redirect to `The big picture` because vault is migrated and seeded
	redirect(307, '/');
};
