import prisma from '$lib/helpers/prisma';
import { getSelectTransactionCategories, getSelectAccounts } from '$lib/helpers/forms';
import { notFound } from '$lib/helpers/misc';

interface Params {
	slug: string | null;
}

export const load = async ({ params }: { params: Params }) => {
	const { slug } = params;

	if (!slug) return notFound();

	const transactionIds = slug.split('-').map((id) => parseInt(id));
	const batchTransactions = await prisma.transaction.findMany({
		where: {
			id: {
				in: transactionIds
			}
		}
	});

	if (!batchTransactions) return notFound();

	// Get baseline transaction details
	const { accountId, categoryId, description, date, isExcluded, isPending, value } = batchTransactions[0]; // prettier-ignore
	const hasSharedAccounts = batchTransactions.every((transaction) => transaction.accountId === accountId); // prettier-ignore
	const hasSharedDescriptions = batchTransactions.every((transaction) => transaction.description === description); // prettier-ignore
	const hasSharedCategories = batchTransactions.every((transaction) => transaction.categoryId === categoryId); // prettier-ignore
	const hasSharedDates = batchTransactions.every((transaction) => transaction.date === date); // prettier-ignore
	const hasSharedIsExcluded = batchTransactions.every((transaction) => transaction.isExcluded === isExcluded); // prettier-ignore
	const hasSharedIsPending = batchTransactions.every((transaction) => transaction.isPending === isPending); // prettier-ignore
	const hasSharedValues = batchTransactions.every((transaction) => transaction.value === value); // prettier-ignore

	const selectAccounts = await getSelectAccounts();
	const selectTransactionCategories = await getSelectTransactionCategories();

	return {
		batchTransactions,
		selectAccounts,
		selectTransactionCategories,
		hasSharedAccounts,
		hasSharedCategories,
		hasSharedDescriptions,
		hasSharedDates,
		hasSharedIsExcluded,
		hasSharedIsPending,
		hasSharedValues
	};
};
