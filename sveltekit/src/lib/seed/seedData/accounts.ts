import { BalanceGroup } from '$lib/helpers/constants';

export const accountCheckingDetails = {
	name: "Bob's Laughable-Yield Checking",
	balanceGroup: BalanceGroup.CASH,
	tag: 'Checking',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountSavingsDetails = {
	name: 'Emergency Fund',
	balanceGroup: BalanceGroup.CASH,
	tag: 'Savings',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountCreditCardDetails = {
	name: "Alice's Limited Rewards",
	balanceGroup: BalanceGroup.DEBT,
	tag: 'Credit Card',
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Juggernaut Bank'
};

export const accountAutoLoanDetails = {
	name: 'Fiat Auto Loan',
	balanceGroup: BalanceGroup.DEBT,
	tag: 'Auto Loan',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Fiat Financial Services'
};

export const accountRothIraDetails = {
	name: "Alice's Roth IRA",
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: 'Roth IRA',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const account401kDetails = {
	name: "Bob's 401k",
	balanceGroup: BalanceGroup.INVESTMENTS,
	tag: '401k',
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const accountWalletDetails = {
	name: 'Matress Wallet',
	balanceGroup: BalanceGroup.CASH,
	tag: 'Wallet',
	isAutoCalculated: false,
	isClosed: false
};
