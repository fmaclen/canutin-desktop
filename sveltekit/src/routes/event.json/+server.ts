import { json } from '@sveltejs/kit';

import prisma from '$lib/helpers/prisma.server';
import { EventStatus } from '$lib/helpers/constants';

const markAsRead = async (eventIds: number) => {
	await prisma.event.updateMany({
		where: { id: eventIds },
		data: { status: EventStatus.READ }
	});
};

export const GET = async () => {
	const events = await prisma.event.findMany({ where: { status: { not: EventStatus.READ } } });

	for (const event of events) {
		// Don't mark ongoing events as read, only the originating process should do that.
		if (event.status === EventStatus.ONGOING) continue;

		// Events are polled by the clients every 1 second, so we need to mark them as read
		// after 999ms so all connected clients receive the event before it's marked as read.
		const ALMOST_A_SECOND = 999;
		setTimeout(() => markAsRead(event.id), ALMOST_A_SECOND);
	}

	return json(events);
};
