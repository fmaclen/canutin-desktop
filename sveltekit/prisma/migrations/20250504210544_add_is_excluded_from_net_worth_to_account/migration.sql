-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Account" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "isClosed" BOOLEAN NOT NULL,
    "isAutoCalculated" BOOLEAN NOT NULL,
    "isExcludedFromNetWorth" BOOLEAN NOT NULL DEFAULT false,
    "balanceGroup" INTEGER NOT NULL,
    "accountTypeId" INTEGER NOT NULL,
    CONSTRAINT "Account_accountTypeId_fkey" FOREIGN KEY ("accountTypeId") REFERENCES "AccountType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Account" ("accountTypeId", "balanceGroup", "createdAt", "id", "institution", "isAutoCalculated", "isClosed", "name", "updatedAt") SELECT "accountTypeId", "balanceGroup", "createdAt", "id", "institution", "isAutoCalculated", "isClosed", "name", "updatedAt" FROM "Account";
DROP TABLE "Account";
ALTER TABLE "new_Account" RENAME TO "Account";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Account_1" ON "Account"("name");
Pragma writable_schema=0;
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
