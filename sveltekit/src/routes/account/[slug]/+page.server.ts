import { redirect } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';
import { getSelectAccountTypes, selectBalanceGroups } from '$lib/helpers/forms';
import type { Account } from '@prisma/client';
import { SortOrder } from '$lib/helpers/constants';

interface Params {
	slug: string | null;
}

const returnNotFound = () => {
	throw redirect(307, '/404');
};

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug) returnNotFound();

	const account = (await prisma.account.findUnique({ where: { id: parseInt(slug!) } })) as Account;

	if (!account) returnNotFound();

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
