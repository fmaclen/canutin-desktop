import { SortOrder } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma.server';

const selectOptionsQuery = { select: { id: true, name: true } };
const getSelectFor = (options: { id: number; name: string }[]) => {
	return options.map((option) => ({
		label: option.name,
		value: option.id
	}));
};

// Assets

// Get list of asset types and format it for the select field
export const getSelectAssetTypes = async () => {
	const assetTypes = await prisma.assetType.findMany(selectOptionsQuery);
	return getSelectFor(assetTypes);
};

// List of asset types that can be expressed by quantity/cost
export const getQuantifiableAssetTypes = async () => {
	const quantifiableAssetTypeNames = ['Security', 'Cryptocurrency', 'Precious metal'];
	const quantifiableAssetTypes = await getSelectAssetTypes();

	return quantifiableAssetTypes
		.filter((assetType) => quantifiableAssetTypeNames.includes(assetType.label))
		.map((assetType) => assetType.value);
};

// Accounts

// Get list of account types and format it for the select field
export const getSelectAccountTypes = async () => {
	const accountTypes = await prisma.accountType.findMany(selectOptionsQuery);
	return getSelectFor(accountTypes);
};

// Transactions

// Get list of transaction categories and format it for the select field
export const getSelectTransactionCategories = async () => {
	const transactionCategories = await prisma.transactionCategory.findMany({
		...selectOptionsQuery,
		orderBy: { name: SortOrder.ASC }
	});
	return getSelectFor(transactionCategories);
};

export const getSelectAccounts = async () => {
	const accounts = await prisma.account.findMany(selectOptionsQuery);
	return getSelectFor(accounts);
};
