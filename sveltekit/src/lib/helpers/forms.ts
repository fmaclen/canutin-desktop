import { BalanceGroup, getBalanceGroupLabel } from '$lib/helpers/constants';

export interface CRUDResponse {
	payload?: any; /// e.g. Prisma.BatchPayload | Account | Asset | Transaction | number | etc...
	error?: any;
}

// Get list of balance groups and format it for the select field
export const selectBalanceGroups = [
	{ label: getBalanceGroupLabel(BalanceGroup.CASH) },
	{ label: getBalanceGroupLabel(BalanceGroup.DEBT) },
	{ label: getBalanceGroupLabel(BalanceGroup.INVESTMENTS) },
	{ label: getBalanceGroupLabel(BalanceGroup.OTHER_ASSETS) }
];
