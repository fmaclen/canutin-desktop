import { ACCESS_KEY_COOKIE_NAME } from './constants';

export const getAccessKeyCookie = (accessKey: string, maxAge?: number) => {
	return `${ACCESS_KEY_COOKIE_NAME}${accessKey}; path=/; max-age=${
		maxAge ? maxAge : 31536000
	}; SameSite=Lax;`;
};
