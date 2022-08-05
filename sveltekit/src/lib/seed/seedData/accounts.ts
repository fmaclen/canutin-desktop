import { BalanceGroup } from '$lib/helpers/constants';
import { getModelType } from '$lib/helpers/models';

export const accountCheckingDetails = {
	name: "Bob's Laughable-Yield Checking",
	balanceGroup: BalanceGroup.CASH,
	accountTypeId: await getModelType('checking', true),
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountSavingsDetails = {
	name: 'Emergency Fund',
	balanceGroup: BalanceGroup.CASH,
	accountTypeId: await getModelType('savings', true),
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountCreditCardDetails = {
	name: "Alice's Limited Rewards",
	balanceGroup: BalanceGroup.DEBT,
	accountTypeId: await getModelType('credit card', true),
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Juggernaut Bank'
};

export const accountAutoLoanDetails = {
	name: 'Fiat Auto Loan',
	balanceGroup: BalanceGroup.DEBT,
	accountTypeId: await getModelType('auto', true),
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Fiat Financial Services'
};

export const accountRothIraDetails = {
	name: "Alice's Roth IRA",
	balanceGroup: BalanceGroup.INVESTMENTS,
	accountTypeId: await getModelType('roth', true),
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const account401kDetails = {
	name: "Bob's 401k",
	balanceGroup: BalanceGroup.INVESTMENTS,
	accountTypeId: await getModelType('401k', true),
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const accountWalletDetails = {
	name: 'Matress Wallet',
	balanceGroup: BalanceGroup.CASH,
	accountTypeId: await getModelType('cash', true),
	isAutoCalculated: false,
	isClosed: false
};
