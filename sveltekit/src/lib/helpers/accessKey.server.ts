import prisma from '$lib/helpers/prisma';
import { AccessKeySettings, ACCESS_KEY_COOKIE_NAME } from '$lib/helpers/constants';
import type { AccessKeyStatusStore } from '$lib/stores/accessKeyStatusStore';

export const getAccessKeySettings = async (): Promise<AccessKeyStatusStore> => {
	const accessKeySettings = Object.values(AccessKeySettings);
	const accessKeyValues = await prisma.setting.findMany({
		where: { name: { in: accessKeySettings } }
	});

	const accessKey = accessKeyValues.find(
		(setting) => setting.name === AccessKeySettings.ACCESS_KEY
	);

	return {
		accessKey: accessKey?.value
	};
};

export const getVaultAccessKey = async () => {
	return await prisma.setting.findUnique({
		where: { name: AccessKeySettings.ACCESS_KEY },
		select: { value: true }
	});
};

export const isRequestAuthorized = async (request: Request) => {
	const cookie = request.headers.get('cookie');
	const requestAccessKey = cookie?.split(ACCESS_KEY_COOKIE_NAME)[1];
	const vaultAccessKey = await getVaultAccessKey();

	return vaultAccessKey === null || vaultAccessKey?.value === requestAccessKey;
};
