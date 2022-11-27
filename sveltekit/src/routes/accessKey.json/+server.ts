import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';
import { AccessKeySettings, ACCESS_KEY_COOKIE_NAME } from '$lib/helpers/constants';

const ACCESS_KEY_UNAUTHORIZED = 'Unauthorized';

const getVaultAccessKey = async () => {
	return await prisma.setting.findUnique({
		where: { name: AccessKeySettings.ACCESS_KEY },
		select: { value: true }
	});
};

export const isRequestAuthorized = async (request: Request) => {
	const cookie = request.headers.get('cookie');
	const requestAccessKey = cookie?.split(ACCESS_KEY_COOKIE_NAME)[1];
	const vaultAccessKey = await getVaultAccessKey();

	return vaultAccessKey === null || vaultAccessKey?.value === requestAccessKey;
};

export const POST = async ({ request }: RequestEvent) => {
	const vaultAccessKey = await getVaultAccessKey();
	const requestAccessKey = (await request.json()) as string;

	if (vaultAccessKey?.value !== requestAccessKey)
		return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });

	return json(requestAccessKey);
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
	return isAuthorized
		? json(requestAccessKey)
		: new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });
};

export const DELETE = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	if (!isAuthorized) return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });

	console.log(await prisma.setting.delete({ where: { name: AccessKeySettings.ACCESS_KEY } }));

	return json(true);
};
