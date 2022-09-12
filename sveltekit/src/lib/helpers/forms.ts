import { BalanceGroup, getBalanceGroupLabel } from '$lib/helpers/constants';
import prisma from '$lib/helpers/prisma';

export interface addOrUpdateAPI {
	id?: number;
	error: any;
}

// Assets
interface AssetForm {
	name: string;
	assetTypeId: number;
	balanceGroup: number;
	isSold: boolean;
	symbol?: string;
	id?: number;
}

interface AssetBalanceStatementForm {
	assetId: number;
	value: number;
	quantity?: number;
	cost?: number;
}

export interface AssetFormPayload {
	assetForm?: AssetForm;
	assetBalanceStatementForm?: AssetBalanceStatementForm;
}

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
