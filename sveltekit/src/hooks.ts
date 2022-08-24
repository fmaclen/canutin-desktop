import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// Every time the vault is switched we need to check if it's migrated and seeded.
	// The check is performed by the `/vault` route so we need to redirect any request
	// to that path when the flag `ELECTRON_SWITCHED_VAULT=true` is set.

	const skipRedirectPaths = [
		'/vault', // Don't redirect when the path is already `/vault`
		'/devTools' // We use `/devTools` for running tests and don't want to redirect there
	];
	const shouldRedirect = !skipRedirectPaths.some((pathName) =>
		event.url.pathname.includes(pathName)
	);

	if (shouldRedirect && env.ELECTRON_SWITCHED_VAULT === 'true') {
		// Force redirect to not use `http:` in production because it'a always `localhost`
		const url = new URL(event.url.origin);
		url.protocol = 'http:';
		return Response.redirect(`${url.origin}/vault`, 307);
	}

	// No changes to the vault, continue as normal
	const response = await resolve(event);
	return response;
};
