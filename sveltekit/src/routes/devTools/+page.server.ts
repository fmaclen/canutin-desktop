import { env } from '$env/dynamic/private';

export const load = async () => {
	return { dbUrl: env.DATABASE_URL };
};
