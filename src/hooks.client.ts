import { env } from '$env/dynamic/public';
import type { RequestEvent } from '@sveltejs/kit';
import PocketBase from 'pocketbase';

export async function handle({ event }: { event: RequestEvent }) {
	event.locals.pb = new PocketBase(env.PUBLIC_POCKETBASE_URL);
  event.locals.pb.admins.authWithPassword(env.PUBLIC_POCKETBASE_ADMIN_EMAIL, env.PUBLIC_POCKETBASE_ADMIN_PASSWORD);
	return { pb: event.locals.pb };
}
