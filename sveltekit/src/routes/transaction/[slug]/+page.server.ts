import prisma from '$lib/helpers/prisma';
import { getSelectTransactionCategories, getSelectAccounts } from '$lib/helpers/forms';
import type { Transaction } from '@prisma/client';
import { notFound } from '$lib/helpers/misc';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug) return notFound();

	const transaction = (await prisma.transaction.findUnique({
		where: { id: parseInt(slug!) }
	})) as Transaction;

	if (!transaction) return notFound();

	const selectAccounts = await getSelectAccounts();
	const selectTransactionCategories = await getSelectTransactionCategories();

	return {
		transaction,
		selectAccounts,
		selectTransactionCategories
	};
};
