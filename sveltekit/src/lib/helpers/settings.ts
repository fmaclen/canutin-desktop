import prisma from '$lib/helpers/prisma';
import { AccessKeySettings } from './constants';
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
		isEnabled: accessKey ? accessKey.value !== '' : false,
		accessKey: accessKey?.value
	};
};
