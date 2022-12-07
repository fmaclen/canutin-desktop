import { json } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma.server';

enum EventStatus {
	READ,
	UNREAD
}

export const GET = async () => {
	const events = await prisma.event.findMany({ where: { status: EventStatus.UNREAD } });

	// Mark events as read
	await prisma.event.updateMany({
		where: { status: EventStatus.UNREAD },
		data: { status: EventStatus.READ }
	});

	return json(events);
};
