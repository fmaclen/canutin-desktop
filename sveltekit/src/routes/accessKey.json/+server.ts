import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma.server';
import {
	UNAUTHORIZED_RESPONSE_MESSAGE,
	UNAUTHORIZED_RESPONSE_STATUS,
	AccessKeySettings,
	Appearance
} from '$lib/helpers/constants';
import { getVaultAccessKey, isRequestAuthorized } from '$lib/helpers/accessKey.server';
import { createSuccessEvent } from '$lib/helpers/events.server';

export const POST = async ({ request }: RequestEvent) => {
	const vaultAccessKey = await getVaultAccessKey();
	const requestAccessKey = (await request.json()) as string;

	if (vaultAccessKey?.value !== requestAccessKey)
		return new Response(UNAUTHORIZED_RESPONSE_MESSAGE, UNAUTHORIZED_RESPONSE_STATUS);

	await createSuccessEvent(`Access key is authorized`, Appearance.ACTIVE);
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
		await createSuccessEvent(`Access key has been set`);
		return json({ accessKey: requestAccessKey });
	} else {
		await createSuccessEvent('Access key is not authorized', Appearance.NEGATIVE);
		return new Response(UNAUTHORIZED_RESPONSE_MESSAGE, UNAUTHORIZED_RESPONSE_STATUS);
	}
};

export const DELETE = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	if (!isAuthorized)
		return new Response(UNAUTHORIZED_RESPONSE_MESSAGE, UNAUTHORIZED_RESPONSE_STATUS);

	await prisma.setting.delete({ where: { name: AccessKeySettings.ACCESS_KEY } });

	await createSuccessEvent(`Access key has been removed`, Appearance.ACTIVE);
	return json({ accessKey: null });
};
