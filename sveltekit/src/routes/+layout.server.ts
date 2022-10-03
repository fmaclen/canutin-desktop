import { env } from '$env/dynamic/private';
import prisma from '$lib/helpers/prisma';
import { SyncSettings } from '$lib/helpers/constants';

export const load = async () => {
	const syncEnabled = await prisma.setting.findFirst({
		where: { name: SyncSettings.SYNC_ENABLED }
	});
	const isSyncEnabled = syncEnabled?.value === '1' ? true : false;

	return { appVersion: env.APP_VERSION, isSyncEnabled };
};
