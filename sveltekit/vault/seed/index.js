import PocketBase from 'pocketbase';
import readline from 'readline';

import {
  accountCheckingDetails,
  accountSavingsDetails,
  accountCreditCardDetails,
  accountAutoLoanDetails,
  accountRothIraDetails,
  account401kDetails,
  accountWalletDetails
} from './seedData/accounts.js';

import {
  assetSecurityTeslaDetails,
  assetSecurityGamestopDetails,
  assetCryptoBitcoinDetails,
  assetCryptoEthereumDetails,
  assetCollectibleDetails,
  assetVehicleDetails
} from './seedData/assets.js';

import {
  accountCheckingTransactionSet,
  accountSavingsTransactionSet,
  accountCreditCardTransactionSet
} from './seedData/transactions.js';

import {
  account401kbalanceStatements,
  accountAutoLoanBalanceStatements,
  accountRothIraBalanceStatements,
  accountWalletBalanceStatements,
  assetTeslaBalanceStatements,
  assetGamestopBalanceStatements,
  assetBitcoinBalanceStatements,
  assetEthereumBalanceStatements,
  assetCollectibleBalanceStatements,
  assetVehicleBalanceStatements
} from './seedData/balanceStatements.js';

const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://127.0.0.1:8090');

function askForConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function deleteAllData() {
  const collections = ['accounts', 'asset', 'transactions', 'accountBalanceStatements', 'assetBalanceStatements'];
  
  for (const collection of collections) {
    const records = await pb.collection(collection).getFullList();
    for (const record of records) {
      await pb.collection(collection).delete(record.id);
    }
    console.warn(`-> Deleted all records from ${collection}`);
  }
}

async function getTagId(name, type) {
  try {
    const result = await pb.collection('tags').getFirstListItem(`name ~ "${name}" && for = "${type}"`);
    return result.id;
  } catch (error) {
    return null;
  }
}

async function seedAccounts() {
  const accounts = [
    accountCheckingDetails,
    accountSavingsDetails,
    accountCreditCardDetails,
    accountAutoLoanDetails,
    accountRothIraDetails,
    account401kDetails,
    accountWalletDetails
  ];

  for (const account of accounts) {
    const tagId = await getTagId(account.tag, 'accounts');
    await pb.collection('accounts').create({
      ...account,
      tag: tagId
    });
  }
  console.warn('-> Accounts seeded successfully');
}

async function seedAssets() {
  const assets = [
    assetSecurityTeslaDetails,
    assetSecurityGamestopDetails,
    assetCryptoBitcoinDetails,
    assetCryptoEthereumDetails,
    assetCollectibleDetails,
    assetVehicleDetails
  ];

  for (const asset of assets) {
    const tagId = await getTagId(asset.tag, 'assets');
    await pb.collection('asset').create({
      ...asset,
      tag: tagId
    });
  }
  console.warn('-> Assets seeded successfully');
}

async function seedTransactions() {
  const checkingAccount = await pb.collection('accounts').getFirstListItem('name="Bob\'s Laughable-Yield Checking"');
  const savingsAccount = await pb.collection('accounts').getFirstListItem('name="Emergency Fund"');
  const creditCardAccount = await pb.collection('accounts').getFirstListItem('name="Alice\'s Limited Rewards"');

  const checkingTransactions = await accountCheckingTransactionSet();
  const savingsTransactions = await accountSavingsTransactionSet();
  const creditCardTransactions = await accountCreditCardTransactionSet();

  for (const transaction of checkingTransactions) {
    const tagId = await getTagId(transaction.tag, 'transactions');
    await pb.collection('transactions').create({
      ...transaction,
      account: checkingAccount.id,
      tag: tagId
    });
  }

  for (const transaction of savingsTransactions) {
    const tagId = await getTagId(transaction.tag, 'transactions');
    await pb.collection('transactions').create({
      ...transaction,
      account: savingsAccount.id,
      tag: tagId
    });
  }

  for (const transaction of creditCardTransactions) {
    const tagId = await getTagId(transaction.tag, 'transactions');
    await pb.collection('transactions').create({
      ...transaction,
      account: creditCardAccount.id,
      tag: tagId
    });
  }

  console.warn('-> Transactions seeded successfully');
}

async function seedBalanceStatements() {
  const accounts = await pb.collection('accounts').getFullList();
  const assets = await pb.collection('asset').getFullList();

  const balanceStatements = [
    { account: '401k', data: account401kbalanceStatements },
    { account: 'Auto Loan', data: accountAutoLoanBalanceStatements },
    { account: 'Roth IRA', data: accountRothIraBalanceStatements },
    { account: 'Wallet', data: accountWalletBalanceStatements },
    { asset: 'Tesla', data: assetTeslaBalanceStatements },
    { asset: 'GameStop', data: assetGamestopBalanceStatements },
    { asset: 'Bitcoin', data: assetBitcoinBalanceStatements },
    { asset: 'Ethereum', data: assetEthereumBalanceStatements },
    { asset: 'Manchild Card Collection', data: assetCollectibleBalanceStatements },
    { asset: '1998 Fiat Multipla', data: assetVehicleBalanceStatements }
  ];

  for (const statement of balanceStatements) {
    const item = statement.account
      ? accounts.find(a => a.name.includes(statement.account))
      : assets.find(a => a.name === statement.asset);

    if (item) {
      for (const balanceData of statement.data) {
        await pb.collection(statement.account ? 'accountBalanceStatements' : 'assetBalanceStatements').create({
          ...balanceData,
          [statement.account ? 'account' : 'asset']: item.id
        });
      }
    }
  }

  console.warn('-> Balance statements seeded successfully');
}

async function main() {
  try {
    await pb.admins.authWithPassword('playwright@example.com', 'playwright');

    // Check if data already exists
    const existingAccounts = await pb.collection('accounts').getList(1, 1);
    const existingAssets = await pb.collection('asset').getList(1, 1);
    const existingTransactions = await pb.collection('transactions').getList(1, 1);
    
    if (existingAccounts.totalItems > 0 || existingAssets.totalItems > 0 || existingTransactions.totalItems > 0) {
      const confirmed = await askForConfirmation('-> Existing data found. Do you want to delete all existing data and reseed? (y/n): ');
      if (confirmed) {
        await deleteAllData();
      } else {
        console.warn('-> Seeding cancelled by user.');
        return;
      }
    }

    await seedAccounts();
    await seedAssets();
    await seedTransactions();
    await seedBalanceStatements();

    console.warn('-> All data seeded successfully');
  } catch (error) {
    console.warn('-> Error seeding data:', error);
  }
}

main()
  .catch((e) => {
    console.warn('-> Error:', e);
    process.exit(1);
  });
