import { randomUUID } from 'crypto';

import { pb, POCKETBASE_SEED_ADMIN_EMAIL, POCKETBASE_SEED_DEFAULT_PASSWORD } from '$lib/pocketbase';

export async function createVerifiedUniqueUser(baseName: string) {
	await pb.admins.authWithPassword(POCKETBASE_SEED_ADMIN_EMAIL, POCKETBASE_SEED_DEFAULT_PASSWORD);
	const shortUUID = randomUUID().split('-')[0];
	const email = `${baseName}.${shortUUID}@canutin.com`;
	const user = await pb.collection('users').create({
		email,
		password: POCKETBASE_SEED_DEFAULT_PASSWORD,
		passwordConfirm: POCKETBASE_SEED_DEFAULT_PASSWORD,
		name: `${baseName.slice(0, 1).toUpperCase() + baseName.slice(1)} ${shortUUID}`
	});
	await pb.collection('users').update(user.id, { verified: true });
	return user;
}
