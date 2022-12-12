import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma.server';
import { AccessKeySettings, Appearance } from '$lib/helpers/constants';
import { getVaultAccessKey, isRequestAuthorized } from '$lib/helpers/accessKey.server';
import { createSuccessEvent } from '$lib/helpers/events.server';

const ACCESS_KEY_UNAUTHORIZED = 'Unauthorized';

export const POST = async ({ request }: RequestEvent) => {
	const vaultAccessKey = await getVaultAccessKey();
	const requestAccessKey = (await request.json()) as string;

	if (vaultAccessKey?.value !== requestAccessKey)
		return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });

	createSuccessEvent(`Access key is authorized`, Appearance.POSITIVE);
	return json({ accessKey: requestAccessKey });
};

export const PATCH = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	const requestAccessKey = (await request.json()) as string;

	// Create or update setting
	await prisma.setting.upsert({
		where: { name: AccessKeySettings.ACCESS_KEY },
		update: { value: requestAccessKey },
		create: { name: AccessKeySettings.ACCESS_KEY, value: requestAccessKey }
	});

	// Return 200 if authorized, 401 if not
	if (isAuthorized) {
		createSuccessEvent(`Access key has been set`, Appearance.POSITIVE);
		return json({ accessKey: requestAccessKey });
	} else {
		createSuccessEvent('Access key is not authorized', Appearance.NEGATIVE);
		return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	if (!isAuthorized) return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });

	await prisma.setting.delete({ where: { name: AccessKeySettings.ACCESS_KEY } });

	createSuccessEvent(`Access key has been removed`, Appearance.ACTIVE);
	return json({ accessKey: null });
};
