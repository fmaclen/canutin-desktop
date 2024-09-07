import { randomUUID } from 'crypto';
import PocketBase from 'pocketbase';

import { POCKETBASE_DEFAULT_URL } from '$lib/pocketbase';
import type { TypedPocketBase } from '$lib/pocketbase-types';

export const POCKETBASE_SEED_ADMIN_EMAIL = 'admin@canutin.com';
export const POCKETBASE_SEED_DEFAULT_PASSWORD = '123qweasdzxc';

export const pb = new PocketBase(POCKETBASE_DEFAULT_URL) as TypedPocketBase;

export async function seedUniqueUser(baseName: string) {
	await pb.admins.authWithPassword(POCKETBASE_SEED_ADMIN_EMAIL, POCKETBASE_SEED_DEFAULT_PASSWORD);

	const shortUUID = randomUUID().split('-')[0];
	const email = `${baseName}.${shortUUID}@canutin.com`;
	const user = await pb.collection('users').create({
		email,
		password: POCKETBASE_SEED_DEFAULT_PASSWORD,
		passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD,
		name: `${baseName.slice(0, 1).toUpperCase() + baseName.slice(1)} ${shortUUID}`
	});

	return user;
}
