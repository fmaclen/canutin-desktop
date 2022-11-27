import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { isRequestAuthorized } from './routes/accessKey.json/+server';

const redirectTo = (origin: string, route: string) => {
	return Response.redirect(`${origin}${route}`, 307);
};

export const handle: Handle = async ({ event, resolve }) => {
	// Simulate an internal server error by visiting `/500` in dev
	if (dev && event.url.pathname.startsWith('/500'))
		throw new Error(
			'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
		);

	// Prevents infinite redirect loop on `/vault` and `/accessKey`
	const skipPaths = [
		'/vault',
		'/accessKey',
		'/devTools' // We use `/devTools` in tests to bypass the `/vault` logic in tests
	];

	if (!skipPaths.some((path) => event.url.pathname.includes(path))) {
		// Vault
		//
		// Every time the vault is switched we need to check if it's migrated and seeded.
		// The check is performed by the `/vault` route so we need to redirect any request
		// to that path when the flag `ELECTRON_SWITCHED_VAULT=true` is set.
		const shouldVaultBeChecked = env.ELECTRON_SWITCHED_VAULT === 'true';
		if (shouldVaultBeChecked) return redirectTo(event.url.origin, '/vault');

		// Access key
		//
		// If the vault is protected by an access key we need to check if the request has the correct key
		const isAuthorized = await isRequestAuthorized(event.request);
		if (!isAuthorized) return redirectTo(event.url.origin, '/accessKey');
	}

	// No need to redirect anywhere, continue as normal
	return await resolve(event);
};
