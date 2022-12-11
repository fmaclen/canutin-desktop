import prisma from '$lib/helpers/prisma.server';
import { Appearance, EventStatus } from './constants';

export const markEventAsRead = async (id: number) => {
	await prisma.event.update({
		where: { id },
		data: { status: EventStatus.READ }
	});
};

export const createLoadingEvent = async (message: string) => {
	return await prisma.event.create({
		data: {
			message,
			dismissAfter: 0,
			status: EventStatus.ONGOING
		}
	});
};

export const createSuccessEvent = async (message: string, appearance = Appearance.POSITIVE) => {
	return await prisma.event.create({
		data: {
			message,
			appearance,
			status: EventStatus.UNREAD
		}
	});
};

export const createErrorEvent = async (message: string) => {
	return await prisma.event.create({
		data: {
			message,
			dismissAfter: 0,
			appearance: Appearance.NEGATIVE,
			status: EventStatus.UNREAD
		}
	});
};
