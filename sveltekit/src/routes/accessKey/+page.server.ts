import { redirect } from '@sveltejs/kit';

import { getAccessKeySettings } from '$lib/helpers/accessKey.server';

export const load = async () => {
	const { accessKey } = await getAccessKeySettings();

	// Redirect to the home page if the access key is not set
	if (!accessKey) redirect(307, '/');
};
