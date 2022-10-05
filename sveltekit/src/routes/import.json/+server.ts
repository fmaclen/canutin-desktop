import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import { importFromCanutinFile } from '$lib/helpers/import';

export const POST = async ({ request }: RequestEvent) => {
	const canutinFile = await request.json();
	const importResult = await importFromCanutinFile(canutinFile);

	return json(importResult);
};
