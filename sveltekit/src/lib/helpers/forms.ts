import { BalanceGroup, getBalanceGroupLabel } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma';

export interface AddOrUpdateAPIResponse {
	id?: number;
	error?: any;
}

// Assets
// Get list of asset types and format it for the select field
export const getSelectAssetTypes = async () => {
	const assetTypes = await prisma.assetType.findMany({
		select: { id: true, name: true }
	});

	return assetTypes.map((assetType) => ({
		label: assetType.name,
		value: assetType.id
	}));
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
	const accountTypes = await prisma.accountType.findMany({
		select: { id: true, name: true }
	});

	return accountTypes.map((accountType) => ({
		label: accountType.name,
		value: accountType.id
	}));
};

// Get list of balance groups and format it for the select field
export const selectBalanceGroups = [
	{ label: getBalanceGroupLabel(BalanceGroup.CASH) },
	{ label: getBalanceGroupLabel(BalanceGroup.DEBT) },
	{ label: getBalanceGroupLabel(BalanceGroup.INVESTMENTS) },
	{ label: getBalanceGroupLabel(BalanceGroup.OTHER_ASSETS) }
];

// Transactions
// Get list of transaction categories and format it for the select field
export const getSelectTransactionCategories = async () => {
	const transactionCategories = await prisma.transactionCategory.findMany({
		select: { id: true, name: true }
	});

	return transactionCategories.map((accountType) => ({
		label: accountType.name,
		value: accountType.id
	}));
};

export const getSelectAccounts = async () => {
	const accounts = await prisma.account.findMany({
		select: { id: true, name: true }
	});

	return accounts.map((accountType) => ({
		label: accountType.name,
		value: accountType.id
	}));
};
