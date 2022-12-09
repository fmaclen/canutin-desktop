import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma.server';
import { importFromCanutinFile } from '$lib/helpers/import.server';
import { Appearance, EventStatus } from '$lib/helpers/constants';

const markProcessingEventAsRead = async (id: number) => {
	await prisma.event.update({
		where: { id },
		data: { status: EventStatus.READ }
	});
};

export const POST = async ({ request }: RequestEvent) => {
	const canutinFile = await request.json();
	const processingEvent = await prisma.event.create({
		data: {
			message: 'Processing import',
			dismissAfter: 0,
			appearance: Appearance.ACTIVE,
			status: EventStatus.ONGOING
		}
	});

	const importResult = await importFromCanutinFile(canutinFile);

	if (!importResult.error) {
		await markProcessingEventAsRead(processingEvent.id);

		await prisma.event.create({
			data: {
				message: 'Import was successful',
				appearance: Appearance.POSITIVE,
				status: EventStatus.UNREAD
			}
		});

		return json(importResult);
	} else {
		await markProcessingEventAsRead(processingEvent.id);

		await prisma.event.create({
			data: {
				message: importResult.error,
				dismissAfter: 0,
				appearance: Appearance.NEGATIVE,
				status: EventStatus.UNREAD
			}
		});

		return new Response(JSON.stringify(importResult), { status: 400 });
	}
};
