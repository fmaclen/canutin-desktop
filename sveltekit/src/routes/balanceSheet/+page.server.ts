import prisma from '$lib/helpers/prisma.server';
import { getBalanceGroupLabel, SortOrder, BalanceGroup } from '$lib/helpers/constants';
import { getAccountCurrentBalance, getAssetCurrentBalance } from '$lib/helpers/models.server';
import { sortByKey } from '$lib/helpers/misc';

interface BalanceSheetItem {
	id: number;
	name: string;
	balanceGroup: number;
	type: string;
	currentBalance: number;
	isAccount: boolean;
	isExcludedFromNetWorth: boolean;
}

interface BalanceItemsTypeGroup {
	type: string;
	balanceGroup: BalanceGroup;
	currentBalance: number;
	balanceSheetItems: BalanceSheetItem[];
}

export interface BalanceSheetBalanceGroup {
	id: BalanceGroup;
	label: string;
	currentBalance: number;
	balanceItemsTypeGroups: BalanceItemsTypeGroup[];
}

export const load = async () => {
	// Get Accounts and Assets
	const accounts = await prisma.account.findMany({
		include: {
			accountType: {
				select: {
					name: true
				}
			}
		}
	});
	const assets = await prisma.asset.findMany({
		include: {
			assetType: {
				select: {
					name: true
				}
			}
		}
	});
	const balanceItems = [...accounts, ...assets];

	// Get the latest balances for Accounts and Assets
	const balanceSheetItems: BalanceSheetItem[] = [];
	for (const balanceItem of balanceItems) {
		const { id, name, balanceGroup, isExcludedFromNetWorth } = balanceItem;

		let currentBalance: number;
		let type: string;
		let isAccount: boolean;

		if ('accountTypeId' in balanceItem) {
			// It's an Account if has the property `accountType`
			currentBalance = await getAccountCurrentBalance(balanceItem);
			type = balanceItem.accountType.name;
			isAccount = true;
		} else {
			// It's an Asset
			currentBalance = await getAssetCurrentBalance(balanceItem);
			type = balanceItem.assetType.name;
			isAccount = false;
		}

		balanceSheetItems.push({
			id,
			name,
			isAccount,
			balanceGroup,
			type,
			currentBalance,
			isExcludedFromNetWorth
		});
	}

	// Sort `balanceSheetItemsWithBalances` by `currentBalance`
	sortByKey(balanceSheetItems, 'currentBalance', SortOrder.ASC);

	// Group balanceSheetItems by type
	const balanceItemsTypeGroups: BalanceItemsTypeGroup[] = [];
	for (const balanceSheetItem of balanceSheetItems) {
		const { balanceGroup, type, currentBalance, isExcludedFromNetWorth } = balanceSheetItem;

		// Find an existing group type
		const balanceSheetTypeGroup = balanceItemsTypeGroups.find(
			(balanceSheetItemType) => balanceSheetItemType.type === type
		);

		if (balanceSheetTypeGroup) {
			// Add item to existing group
			if (!isExcludedFromNetWorth) {
				balanceSheetTypeGroup.currentBalance += currentBalance;
			}
			balanceSheetTypeGroup.balanceSheetItems.push(balanceSheetItem);
		} else {
			// Create a new group and add item
			balanceItemsTypeGroups.push({
				type,
				balanceGroup,
				currentBalance: isExcludedFromNetWorth ? 0 : currentBalance,
				balanceSheetItems: [balanceSheetItem]
			});
		}
	}

	// Sort `balanceItemsTypeGroups` by `currentBalance`
	sortByKey(balanceItemsTypeGroups, 'currentBalance', SortOrder.ASC);

	// Group balanceItemsTypeGroups by balanceGroup
	const balanceSheetBalanceGroups: BalanceSheetBalanceGroup[] = [];

	for (const balanceItemsTypeGroup of balanceItemsTypeGroups) {
		const { balanceGroup, currentBalance } = balanceItemsTypeGroup;

		// Find an existing balance group
		const balanceSheetBalanceGroup = balanceSheetBalanceGroups.find(
			({ id }) => id === balanceGroup
		);

		if (balanceSheetBalanceGroup) {
			// Add type group to existing balance group
			balanceSheetBalanceGroup.currentBalance += currentBalance;
			balanceSheetBalanceGroup.balanceItemsTypeGroups.push(balanceItemsTypeGroup);
		} else {
			// Create a new balance group and add type group
			balanceSheetBalanceGroups.push({
				id: balanceGroup,
				label: getBalanceGroupLabel(balanceGroup),
				currentBalance,
				balanceItemsTypeGroups: [balanceItemsTypeGroup]
			});
		}
	}

	// Add balanceGroups with a balance of $0 for those without any balances
	const balanceGroups = Object.values(BalanceGroup).filter(
		(balanceGroup) => typeof balanceGroup === 'number'
	);
	for (const balanceGroup of balanceGroups) {
		if (!balanceSheetBalanceGroups.find(({ id }) => id === balanceGroup)) {
			balanceSheetBalanceGroups.push({
				id: balanceGroup as BalanceGroup,
				label: getBalanceGroupLabel(balanceGroup as BalanceGroup),
				currentBalance: 0,
				balanceItemsTypeGroups: []
			});
		}
	}

	// Sort `balanceSheetBalanceGroups` by `balanceGroup`
	sortByKey(balanceSheetBalanceGroups, 'id', SortOrder.DESC);

	return {
		balanceSheetBalanceGroups
	};
};
