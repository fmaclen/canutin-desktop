import { getSyncStatus } from '$lib/helpers/import.server';

export const load = async () => {
	return {
		appVersion: process.env.APP_VERSION,
		syncStatus: await getSyncStatus()
	};
};
