export interface TagDraft {
	name: string;
	id?: string;
}

export interface AccountDraft {
	name: string;
	balanceGroup: number;
	isAutoCalculated: boolean;
	isClosed: boolean;
	balance?: number;
	institution?: string;
	id?: string;
	tag: TagDraft;
}

export const accountCheckingDetails: AccountDraft = {
	name: 'Ransack Laughable-Yield Checking',
	balanceGroup: 0,
	tag: { name: 'Checking' },
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountSavingsDetails: AccountDraft = {
	name: 'Emergency Fund',
	balanceGroup: 0,
	tag: { name: 'Savings' },
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Ransack Bank'
};

export const accountCreditCardDetails: AccountDraft = {
	name: 'JuggernautCard Limited Rewards',
	balanceGroup: 1,
	tag: { name: 'Credit card' },
	isAutoCalculated: true,
	isClosed: false,
	institution: 'Juggernaut Bank'
};

export const accountAutoLoanDetails: AccountDraft = {
	name: 'Fiat Auto Loan',
	balanceGroup: 1,
	tag: { name: 'Auto loan' },
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Fiat Financial Services'
};

export const accountRothIraDetails: AccountDraft = {
	name: 'Retirement Roth IRA',
	balanceGroup: 2,
	tag: { name: 'Roth IRA' },
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const account401kDetails: AccountDraft = {
	name: 'My 401k',
	balanceGroup: 2,
	tag: { name: '401k' },
	isAutoCalculated: false,
	isClosed: false,
	institution: 'Loot Financial'
};

export const accountWalletDetails: AccountDraft = {
	name: 'Matress Wallet',
	balanceGroup: 0,
	tag: { name: 'Cash' },
	isAutoCalculated: false,
	isClosed: false
};
