import type { Setting } from '@prisma/client';
import { SyncSettings } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma';
import { getSyncStatus } from '$lib/helpers/import';

export const load = async () => {
	const syncStatus = await getSyncStatus();
	const syncSettings = [
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_URL } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_FREQUENCY } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_COOKIE } })) as Setting,
		(await prisma.setting.findUnique({ where: { name: SyncSettings.SYNC_JWT } })) as Setting
	];

	return {
		syncStatus,
		syncSettings
	};
};
