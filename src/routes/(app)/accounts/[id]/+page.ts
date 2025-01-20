import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return { accountId: params.id };
};
