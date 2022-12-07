import prisma from '$lib/helpers/prisma.server';
import { AccessKeySettings, ACCESS_KEY_COOKIE_NAME } from '$lib/helpers/constants';

interface AcessKey {
	accessKey: string | undefined;
}

export const getVaultAccessKey = async () => {
	return await prisma.setting.findUnique({
		where: { name: AccessKeySettings.ACCESS_KEY },
		select: { value: true }
	});
};

export const getAccessKeySettings = async (): Promise<AcessKey> => {
	const accessKey = await getVaultAccessKey();

	return {
		accessKey: accessKey ? accessKey?.value : undefined
	};
};

export const isRequestAuthorized = async (request: Request) => {
	const vaultAccessKey = await getVaultAccessKey();

	// If no access key is set, no need to check the cookies
	if (vaultAccessKey === null) return true;

	const cookie = request.headers.get('cookie');
	const requestAccessKey = cookie?.split(ACCESS_KEY_COOKIE_NAME)[1];

	return vaultAccessKey?.value === requestAccessKey;
};
