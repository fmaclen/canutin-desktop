import importFromCanutinFile from '$lib/helpers/importFromCanutinFile';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
	const canutinFile = await request.json();
	const importResult = await importFromCanutinFile(canutinFile);

	return {
		status: 200,
		body: importResult
	};
};
