interface CanutinFileAccountBalanceStatement {
	createdAt: number;
	value: number;
}

interface CanutinFileTransaction {
	createdAt: number;
	description: string;
	date: number;
	value: number;
	isExcluded: boolean;
	isPending: boolean;
	categoryName: string;
}

interface CanutinFileAccount {
	name: string;
	balanceGroup: number;
	isAutoCalculated: boolean;
	isClosed: boolean;
	institution: string;
	accountTypeName: string;
	balanceStatements: CanutinFileAccountBalanceStatement[];
	transactions: CanutinFileTransaction[];
	isExcludedFromNetWorth?: boolean;
}

interface CanutinFileAssetBalanceStatement {
	createdAt: number;
	value: number;
	quantity?: number;
	cost?: number;
}

interface CanutinFileAsset {
	name: string;
	balanceGroup: number;
	isSold: boolean;
	symbol?: string;
	assetTypeName: string;
	balanceStatements: CanutinFileAssetBalanceStatement[];
	isExcludedFromNetWorth?: boolean;
}

export interface CanutinFile {
	accounts: CanutinFileAccount[];
	assets: CanutinFileAsset[];
}

export interface ImportedAccounts {
	created: number[];
	updated: number[];
	transactions: {
		created: number[];
		skipped: CanutinFileTransaction[];
	};
	balanceStatements: {
		created: number[];
		skipped: CanutinFileAccountBalanceStatement[];
	};
}

export interface ImportedAssets {
	created: number[];
	updated: number[];
	balanceStatements: {
		created: number[];
		skipped: CanutinFileAssetBalanceStatement[];
	};
}

export interface ImportSummary {
	error?: string;
	importedAccounts?: ImportedAccounts;
	importedAssets?: ImportedAssets;
}

export interface ImportSync {
	canutinFileUrl: string;
	frequency: number;
	cookie?: string;
	jwt?: string;
}
