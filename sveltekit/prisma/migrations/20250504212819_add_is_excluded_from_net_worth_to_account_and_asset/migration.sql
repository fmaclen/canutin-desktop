-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "balanceGroup" INTEGER NOT NULL,
    "isSold" BOOLEAN NOT NULL,
    "symbol" TEXT,
    "assetTypeId" INTEGER NOT NULL,
    "isExcludedFromNetWorth" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Asset_assetTypeId_fkey" FOREIGN KEY ("assetTypeId") REFERENCES "AssetType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Asset" ("assetTypeId", "balanceGroup", "createdAt", "id", "isSold", "name", "symbol", "updatedAt") SELECT "assetTypeId", "balanceGroup", "createdAt", "id", "isSold", "name", "symbol", "updatedAt" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
Pragma writable_schema=1;
CREATE UNIQUE INDEX "sqlite_autoindex_Asset_1" ON "Asset"("name");
Pragma writable_schema=0;
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
