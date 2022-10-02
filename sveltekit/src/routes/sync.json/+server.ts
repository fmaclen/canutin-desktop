import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma';
import { SyncSettings } from '$lib/helpers/constants';
import { importFromCanutinFile, type ImportSummary, type ImportSync } from '$lib/helpers/import';

const fetchCanutinFile = async (syncUrl: string, syncCookie?: string, syncJwt?: string) => {
	try {
		const response = await fetch(syncUrl, {
			headers: {
				'Content-Type': 'application/json',
				accept: '*/*',
				cookie: (syncCookie && syncCookie) || '',
				authorization: `Bearer ${syncJwt && syncJwt}` || ''
			},
			method: 'GET'
		});
		return await response.json();
	} catch (_e) {
		return { warning: "Couldn't fetch data from the sync URL" };
	}
};

export const GET = async () => {
	// Check if syncing is enabled
	const syncEnabled = await prisma.setting.findFirst({
		where: { name: SyncSettings.SYNC_ENABLED }
	});
	const isSyncEnabled = syncEnabled?.value === '1' ? true : false;
	if (!syncEnabled) return json({ isSyncEnabled });

	// Check that an URL was provided
	const syncUrl = await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_URL } });
	if (!syncUrl) throw new Error('Sync URL not set');

	// Get authorization tokens
	const syncCookie = await prisma.setting.findUnique({
		where: { name: SyncSettings.SYNC_COOKIE }
	});
	const syncJwt = await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_JWT } });

	// Fetch data from the sync URL
	const canutinFile = await fetchCanutinFile(syncUrl.value, syncCookie?.value, syncJwt?.value);
	if (canutinFile.warning) return json({ isSyncEnabled, warning: canutinFile.warning });

	// Import data and return the result
	const importSummary: ImportSummary = await importFromCanutinFile(canutinFile);
	return json({ isSyncEnabled, ...importSummary });
};

export const POST = async ({ request }: RequestEvent) => {
	const payload = (await request.json()) as ImportSync;

	const setSyncDisabled = async () => {
		const setting = {
			name: SyncSettings.SYNC_ENABLED,
			value: '0'
		};
		await prisma.setting.upsert({
			where: { name: setting.name },
			update: {
				...setting
			},
			create: {
				...setting
			}
		});
	};

	try {
		const { canutinFileUrl, frequency, cookie, jwt } = payload;
		const canutinFile = await fetchCanutinFile(canutinFileUrl, cookie, jwt);

		if (!canutinFile?.accounts || !canutinFile?.assets) {
			// Disable sync because there were no `accounts` or `assets` returned from the server
			await setSyncDisabled();
			return json({
				warning: "Coudn't fetch a CanutinFile JSON from the provided URL",
				isSyncEnabled: false
			});
		} else {
			const settings = [];

			// Required fields
			settings.push({ name: SyncSettings.SYNC_ENABLED, value: '1' });
			settings.push({ name: SyncSettings.SYNC_URL, value: canutinFileUrl });
			settings.push({ name: SyncSettings.SYNC_FREQUENCY, value: frequency.toString() });

			// Optional fields
			if (cookie) settings.push({ name: SyncSettings.SYNC_COOKIE, value: cookie });
			if (jwt) settings.push({ name: SyncSettings.SYNC_JWT, value: payload.jwt });

			// Save sync settings to the database
			for (const setting of settings) {
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
			return json({ isSyncEnabled: true });
		}
	} catch (_e) {
		await setSyncDisabled();
		return json({
			error: "Couldnl't connect to the provided URL",
			isSyncEnabled: false
		});
	}
};
