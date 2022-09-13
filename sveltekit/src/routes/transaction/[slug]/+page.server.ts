import { redirect } from '@sveltejs/kit';
import prisma from '$lib/helpers/prisma';
import { getSelectTransactionCategories, getSelectAccounts } from '$lib/helpers/forms';
import type { Transaction } from '@prisma/client';

interface Params {
	slug: string | null;
}

const returnNotFound = () => {
	throw redirect(307, '/404');
};

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug) returnNotFound();

	const transaction = (await prisma.transaction.findUnique({
		where: { id: parseInt(slug!) }
	})) as Transaction;

	if (!transaction) returnNotFound();

	const selectAccounts = await getSelectAccounts();
	const selectTransactionCategories = await getSelectTransactionCategories();

	return {
		transaction,
		selectAccounts,
		selectTransactionCategories
	};
};
