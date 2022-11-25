import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';
import {
	AccessKeySettings,
	ACCESS_KEY_COOKIE_NAME,
	ACCESS_KEY_UNAUTHORIZED
} from '$lib/helpers/constants';

export const isRequestAuthorized = async (request: Request) => {
	const cookie = request.headers.get('cookie');
	const requestAccessKey = cookie?.split(ACCESS_KEY_COOKIE_NAME)[1];

	const existingAccessKey = await prisma.setting.findUnique({
		where: { name: AccessKeySettings.ACCESS_KEY },
		select: { value: true }
	});

	return existingAccessKey === null || existingAccessKey?.value === requestAccessKey;
};

export const GET = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	return json(isAuthorized);
};

export const POST = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	const newAccessKey = (await request.json()) as string;

	// Create or update setting
	await prisma.setting.upsert({
		where: { name: AccessKeySettings.ACCESS_KEY },
		update: { value: newAccessKey },
		create: { name: AccessKeySettings.ACCESS_KEY, value: newAccessKey }
	});

	// Return 200 if authorized, 401 if not
	return isAuthorized ? json(newAccessKey) : new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });
};

export const DELETE = async ({ request }: RequestEvent) => {
	const isAuthorized = await isRequestAuthorized(request);
	if (!isAuthorized) return new Response(ACCESS_KEY_UNAUTHORIZED, { status: 401 });

	console.log(await prisma.setting.delete({ where: { name: AccessKeySettings.ACCESS_KEY } }));

	return json(true);
};
