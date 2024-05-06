import { type Handle, redirect } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import { isEnvTest } from '$lib/helpers/tests.server';
import { isRequestAuthorized } from '$lib/helpers/accessKey.server';
import {
	UNAUTHORIZED_RESPONSE_MESSAGE,
	UNAUTHORIZED_RESPONSE_STATUS
} from '$lib/helpers/constants';

export const handle: Handle = async ({ event, resolve }) => {
	// Simulate an internal server error by visiting `/500` in dev
	if (dev && event.url.pathname.startsWith('/500'))
		throw new Error(
			'This error is intentional and should be referenced by a test. If you see this in production god help us all!'
		);

	// Prevents infinite redirect loop when checking for vault migration or access key authorization
	const skipCheckPaths = ['/vault', '/accessKey'];

	// We use `/devTools` in development or tests to bypass the `/vault` check logic
	if (isEnvTest()) skipCheckPaths.push('/devTools');

	// To test that the logic in `isEnvTest()` works, we set a TEST_ACCESS_KEY environment variable
	// that disables the check for requests to `/devTools.json`
	if (env.TEST_ACCESS_KEY === 'true') skipCheckPaths.push('/devTools.json');

	if (!skipCheckPaths.some((path) => event.url.pathname.includes(path))) {
		// Vault
		//
		// Every time the vault is switched we need to check if it's migrated and seeded.
		// The check is performed by the `/vault` route so we need to redirect any request
		// to that path when the flag `SHOULD_CHECK_VAULT=true` is set.

		// Check if the request is meant for a JSON endpoint
		const isRequestJson = event.url.pathname.includes('.json');

		const shouldVaultBeChecked = env.SHOULD_CHECK_VAULT === 'true';
		if (shouldVaultBeChecked) {
			return isRequestJson
				? new Response('Not ready', { status: 202 })
				: redirect(307, '/vault');
		}

		// Access key
		//
		// If the vault is protected by an access key we need to check if the request has the correct key
		const isAuthorized = await isRequestAuthorized(event.request);
		if (!isAuthorized) {
			return isRequestJson
				? new Response(UNAUTHORIZED_RESPONSE_MESSAGE, UNAUTHORIZED_RESPONSE_STATUS)
				: redirect(307, '/accessKey');
		}
	}

	// No need to redirect anywhere, continue as normal
	return await resolve(event);
};
