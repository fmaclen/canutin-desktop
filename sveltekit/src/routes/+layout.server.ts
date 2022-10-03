import { env } from '$env/dynamic/private';

import { getIsSyncEnabled } from '$lib/helpers/import';

export const load = async () => {
	const isSyncEnabled = await getIsSyncEnabled();

	return {
		appVersion: env.APP_VERSION,
		isSyncEnabled
	};
};
