import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

export const handle: Handle = async ({ event, resolve }) => {
	// Simulate an internal server error by visiting `/500` in dev
	if (dev && event.url.pathname.startsWith('/500'))
		throw new Error(
			'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
		);

	// Every time the vault is switched we need to check if it's migrated and seeded.
	// The check is performed by the `/vault` route so we need to redirect any request
	// to that path when the flag `ELECTRON_SWITCHED_VAULT=true` is set.
	//
	const skipPathNames = [
		'/vault', // Don't redirect when the path is already `/vault`
		'/devTools' // We use `/devTools` in tests to bypass the `/vault` logic
	];
	const shouldRedirect =
		env.ELECTRON_SWITCHED_VAULT === 'true' &&
		!skipPathNames.some((pathName) => event.url.pathname.includes(pathName));

	if (shouldRedirect) {
		// Force redirect to not use `http:` in production because it'a always `localhost`
		const url = new URL(event.url.origin);
		url.protocol = 'http:';
		return Response.redirect(`${url.origin}/vault`, 307);
	}

	// No changes to the vault, continue as normal
	const response = await resolve(event);
	return response;
};
