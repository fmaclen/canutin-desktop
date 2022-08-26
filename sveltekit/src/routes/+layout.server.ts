import { env } from '$env/dynamic/private';

export const load = () => {
	return { appVersion: env.APP_VERSION };
};
