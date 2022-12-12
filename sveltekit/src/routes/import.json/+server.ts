import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import { importFromCanutinFile } from '$lib/helpers/import.server';
import {
	createErrorEvent,
	createLoadingEvent,
	createSuccessEvent,
	markEventAsRead
} from '$lib/helpers/events.server';

export const POST = async ({ request }: RequestEvent) => {
	const canutinFile = await request.json();
	const processingEvent = await createLoadingEvent('Processing import');

	const importResult = await importFromCanutinFile(canutinFile);

	if (!importResult.error) {
		await markEventAsRead(processingEvent.id);
		await createSuccessEvent('Import was successful');
		return json(importResult);
	} else {
		await markEventAsRead(processingEvent.id);
		await createErrorEvent(importResult.error);
		return new Response(JSON.stringify(importResult), { status: 400 });
	}
};
