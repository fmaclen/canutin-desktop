import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { isRequestAuthorized } from './routes/accessKey.json/+server';
import type { RequestEvent } from '.svelte-kit/types/src/routes/$types';

const redirect = (event: RequestEvent, route: string) => {
	// Force redirect to not use `http:` in production because it'a always `localhost`
	const url = new URL(event.url.origin);
	url.protocol = 'http:';
	return Response.redirect(`${url.origin}${route}`, 307);
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
		if (env.ELECTRON_SWITCHED_VAULT === 'true') return redirect(event, '/vault');

		// Access key
		//
		// If the vault is protected by an access key we need to check if the request has the correct key
		const isAuthorized = await isRequestAuthorized(event.request);
		if (!isAuthorized) return redirect(event, '/accessKey');
	}

	// No need to redirect anywhere, continue as normal
	const response = await resolve(event);
	return response;
};
