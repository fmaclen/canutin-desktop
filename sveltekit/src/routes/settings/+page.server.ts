import type { Setting } from '@prisma/client';
import { AccessKeySettings, SyncSettings } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma';
import { getSyncStatus } from '$lib/helpers/import';
import type { AccessKeyStatusStore } from '$lib/stores/accessKeyStatusStore';

const getAccessKeySettings = async (): Promise<AccessKeyStatusStore> => {
	const accessKeySettings = Object.values(AccessKeySettings);
	const accessKeyValues = await prisma.setting.findMany({
		where: { name: { in: accessKeySettings } }
	});

	const accessKey = accessKeyValues.find(
		(setting) => setting.name === AccessKeySettings.ACCESS_KEY
	);

	return {
		accessKey: accessKey?.value
	};
};

export const load = async () => {
	const accessKeySettings = await getAccessKeySettings();

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
		accessKeySettings
	};
};
