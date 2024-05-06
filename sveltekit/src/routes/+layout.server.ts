import { env } from '$env/dynamic/private';
import { APP_VERSION } from '$env/static/private';
import { getSyncStatus } from '$lib/helpers/import.server';

export const load = async () => {
	return {
		appVersion: APP_VERSION,
		plausibleDomain: env.PLAUSIBLE_DOMAIN,
		syncStatus: await getSyncStatus()
	};
};
