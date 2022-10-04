import { env } from '$env/dynamic/private';

import { getSyncStatus } from '$lib/helpers/import';

export const load = async () => {
	return {
		appVersion: env.APP_VERSION,
		syncStatus: await getSyncStatus()
	};
};
