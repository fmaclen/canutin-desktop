import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// Every time the vault is switched we need to check if it's migrated and seeded
	if (env.ELECTRON_SWITCHED_VAULT === 'true') {
		// Don't redirect if the current path is `/vault`
		if (!event.url.pathname.startsWith('/vault')) {
			// Force redirect to not use `http:` in production because it'a always `localhost`
			const url = new URL(event.url.origin);
			url.protocol = 'http:';

			return Response.redirect(`${url.origin}/vault`, 307);
		}
	}

	// No changes to the vault, continue as normal
	const response = await resolve(event);
	return response;
};
