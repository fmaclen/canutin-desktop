import prisma from '$lib/helpers/prisma';
import type { Setting } from '@prisma/client';
import { SyncSettings } from '$lib/helpers/constants';
import { getSyncStatus } from '$lib/helpers/import';
import { getAccessKeySettings } from '$lib/helpers/accessKey.server';

export const load = async () => {
	const { accessKey } = await getAccessKeySettings();

	// FIXME: this could be simplified following the `getAccessKeySettings()` pattern
	const syncStatus = await getSyncStatus();
	const syncSettings = [
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_URL } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_FREQUENCY } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_COOKIE } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_JWT } })) as Setting
	];

	return {
		syncStatus,
		syncSettings,
		accessKey
	};
};
