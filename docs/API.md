# Canutin: Rest API

- [Endpoints](#endpoints)
- [Importing data](#importing-data)
- [Shape of a CanutinFile JSON](#shape-of-a-canutinfile-json)
- [Examples](#examples)

---

## Endpoints

Canutin allows importing and exporting data via a REST API, these are the current endpoints:

| Path                 | Method                                                                                                              | Description                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/account.json`      | [`POST`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/account.json/%2Bserver.ts#L7)          | Creates a new account, balances and/or transactions                                                            |
| `/account.json`      | [`PATCH`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/account.json/%2Bserver.ts#L26)        | Updates an existing account details, balance and/or creates associated transactions                            |
| `/account.json`      | [`DELETE`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/account.json/%2Bserver.ts#L46)       | Permanently deletes an account, it's associated balances, transactions and import history                      |
| `/asset.json`        | [`POST`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/asset.json/%2Bserver.ts#L7)            | Creates a new asset, balances and/or transactions                                                              |
| `/asset.json`        | [`PATCH`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/asset.json/%2Bserver.ts#L26)          | Updates an existing asset details and balance                                                                  |
| `/asset.json`        | [`DELETE`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/asset.json/%2Bserver.ts#L46)         | Permanently deletes an asset and it's associated balances                                                      |
| `/transactions.json` | [`GET`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transactions.json/%2Bserver.ts#L21)     | Returns all transactions (use `keyword`, `dateFrom`, `dateTo` and `sortBy` params to narrow down the results)  |
| `/transactions.json` | [`PATCH`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transactions.json/%2Bserver.ts#L112)  | Update multiple transactions                                                                                   |
| `/transactions.json` | [`DELETE`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transactions.json/%2Bserver.ts#L141) | Permanently delete multiple transactions and import history                                                    |
| `/transaction.json`  | [`POST`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transaction.json/%2Bserver.ts#L8)      | Creates a new transaction                                                                                      |
| `/transaction.json`  | [`PATCH`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transaction.json/%2Bserver.ts#L39)    | Updates an transaction                                                                                         |
| `/transaction.json`  | [`DELETE`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/transaction.json/%2Bserver.ts#L64)   | Permanently deletes a transaction and it's import history                                                      |
| `/devTools.json`     | [`POST` `GET`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/devTools.json/%2Bserver.ts)      | [Various functions](https://github.com/Canutin/desktop/blob/master/sveltekit/src/lib/helpers/constants.ts#L50) |
| `/import.json`       | [`POST`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/import.json/%2Bserver.ts)              | Creates or updates accounts, assets, balances and/or transactions from [JSON payload](#importing-data)         |

## Importing data

To create or update data submit a [`POST`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/routes/import.json/%2Bserver.ts#L6) request to `/import.json` with a [**CanutinFile**](#shape-of-a-canutinfile-json) JSON payload.

This endpoint will return a summary of the data that was succesfully imported and/or data that was skipped if found to be duplicated.

### Shape of a CanutinFile JSON

Typescript interfaces extracted from [`sveltekit/src/lib/helpers/import.ts`](https://github.com/Canutin/desktop/blob/master/sveltekit/src/lib/helpers/import.ts)

```ts
interface CanutinFile {
  accounts: CanutinFileAccount[]; // Empty array is allowed
  assets: CanutinFileAsset[]; // Empty array is allowed
}
```

#### Accounts & transactions

```ts
interface CanutinFileAccount {
  name: string;
  balanceGroup: number;
  isAutoCalculated: boolean;
  isClosed: boolean;
  institution: string;
  accountTypeName: string;
  balanceStatements: CanutinFileAccountBalanceStatement[]; // Empty array is allowed
  transactions: CanutinFileTransaction[]; // Empty array is allowed
}
```

```ts
// For non auto-calculated accounts
interface CanutinFileAccountBalanceStatement {
  createdAt: number;
  value: number;
}
```

```ts
interface CanutinFileTransaction {
  createdAt: number;
  description: string;
  date: number;
  value: number;
  isExcluded: boolean;
  isPending: boolean;
  categoryName: string;
}
```

#### Assets

```ts
interface CanutinFileAsset {
  name: string;
  balanceGroup: number;
  isSold: boolean;
  symbol?: string;
  assetTypeName: string;
  balanceStatements: CanutinFileAssetBalanceStatement[]; // Empty array is allowed
}
```

```ts
interface CanutinFileAssetBalanceStatement {
  createdAt: number;
  value: number;
  quantity?: number;
  cost?: number;
}
```

### Examples

- [canutinFile-maximum-data.json](https://github.com/Canutin/desktop/blob/master/sveltekit/tests/fixtures/canutinFile-maximum-data.json)
- [canutinFile-minimum-data.json](https://github.com/Canutin/desktop/blob/master/sveltekit/tests/fixtures/canutinFile-minimum-data.json)
- [canutinFile-only-accounts.json](https://github.com/Canutin/desktop/blob/master/sveltekit/tests/fixtures/canutinFile-only-accounts.json)
- [canutinFile-only-assets.json](https://github.com/Canutin/desktop/blob/master/sveltekit/tests/fixtures/canutinFile-only-assets.json)
