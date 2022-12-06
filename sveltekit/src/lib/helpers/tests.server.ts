import { env } from '$env/dynamic/private';

export const isEnvTest = () => env.IS_TEST === 'true';
