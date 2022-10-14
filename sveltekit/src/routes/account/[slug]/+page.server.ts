import prisma from '$lib/helpers/prisma';
import { getSelectAccountTypes, selectBalanceGroups } from '$lib/helpers/forms';
import type { Account } from '@prisma/client';
import { SortOrder } from '$lib/helpers/constants';
import { notFound } from '$lib/helpers/misc';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug || Number.isNaN(parseInt(slug))) return notFound();

	const account = (await prisma.account.findUnique({ where: { id: parseInt(slug) } })) as Account;

	if (!account) return notFound();

	const selectAccountTypes = await getSelectAccountTypes();
	const lastBalanceStatement = await prisma.accountBalanceStatement.findFirst({
		where: {
			accountId: account.id
		},
		orderBy: {
			createdAt: SortOrder.DESC
		}
	});

	return {
		account,
		selectAccountTypes,
		selectBalanceGroups,
		lastBalanceStatement
	};
};
