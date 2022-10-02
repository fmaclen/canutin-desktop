import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';
import { importFromCanutinFile } from '$lib/helpers/import';

export const POST = async ({ request }: RequestEvent) => {
	const payload = (await request.json()) as ImportSync;

	const result = await fetch(payload.canutinFileUrl, {
		headers: {
			'Content-Type': 'application/json',
			accept: '*/*',
			cookie: payload.cookie || ''
		},
		method: 'GET'
	});
	const canutinFile = await result.json(); // FIXME: this line fails if the server doesn't respond with a JSON

	console.log('canutinFile', canutinFile);

	// Save sync settings to the database
	const syncUrl = {
		name: 'SYNC_URL',
		value: payload.canutinFileUrl
	};
	const syncFrequency = {
		name: 'SYNC_FREQUENCY',
		value: payload.frequency.toString()
	};
	const syncCookie = {
		name: 'SYNC_COOKIE',
		value: payload.cookie
	};
	const syncJwt = {
		name: 'SYNC_JWT',
		value: payload.jwt
	};

	for (const setting of [syncUrl, syncFrequency, syncCookie, syncJwt]) {
		if (!setting.value) continue;

		await prisma.setting.upsert({
			where: { name: setting.name },
			update: {
				...setting
			},
			create: {
				...setting
			}
		});
	}

	const importResult = canutinFile && (await importFromCanutinFile(canutinFile));

	// TODO: return an error if it can't fetch a canutin file from the server
	return json(importResult);
};

export interface ImportSync {
	canutinFileUrl: string;
	frequency: number;
	cookie?: string;
	jwt?: string;
}
